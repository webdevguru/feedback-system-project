from fastapi import FastAPI, Depends, HTTPException, status, Request, Security, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import timedelta

from . import crud, models, schemas, auth
from .database import SessionLocal, engine

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Feedback System API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://verdant-flan-eea041.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication endpoints
@app.post("/login", response_model=dict)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "manager_id": user.manager_id
        }
    }

@app.post("/register-manager", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def register_manager(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    internal_user_data = schemas.UserCreateInternal(
        **user.dict(),
        role=models.UserRole.MANAGER,
        manager_id=None
    )
    new_manager = crud.create_user(db=db, user=internal_user_data)
    return new_manager

@app.get("/me", response_model=schemas.User)
def get_current_user_info(
    credentials: HTTPAuthorizationCredentials = Depends(auth.security),
    db: Session = Depends(get_db)
):
    return auth.get_current_user(db, credentials)

# User management endpoints
@app.post("/users", response_model=schemas.User)
def create_user(
    user: schemas.UserCreate,
    request: Request,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(auth.security),
):
    current_user = auth.get_current_user(db, credentials)
    if current_user.role != models.UserRole.MANAGER:
        raise HTTPException(status_code=403, detail="Only managers can add employees")
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    internal_user_data = schemas.UserCreateInternal(
        **user.dict(),
        role=models.UserRole.EMPLOYEE,
        manager_id=current_user.id
    )
    return crud.create_user(db=db, user=internal_user_data)

@app.get("/team", response_model=List[schemas.User])
def get_team_members(
    credentials: HTTPAuthorizationCredentials = Depends(auth.security),
    db: Session = Depends(get_db)
):
    current_user = auth.get_current_user(db, credentials)
    if current_user.role != models.UserRole.MANAGER:
        raise HTTPException(status_code=403, detail="Only managers can view team members")
    
    return crud.get_team_members(db, current_user.id)

@app.delete("/users/{employee_id}", response_model=schemas.User)
def delete_employee(
    employee_id: int = Path(..., description="ID of the employee to delete"),
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(auth.security),
):
    current_user = auth.get_current_user(db, credentials)
    if current_user.role != models.UserRole.MANAGER:
        raise HTTPException(status_code=403, detail="Only managers can delete employees")
    # Only allow deleting employees in your own team
    employee = db.query(models.User).filter(
        models.User.id == employee_id,
        models.User.manager_id == current_user.id,
        models.User.role == models.UserRole.EMPLOYEE
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found or not in your team")
    db.delete(employee)
    db.commit()
    return employee

# Feedback endpoints
@app.post("/feedback", response_model=schemas.Feedback)
def create_feedback(
    feedback: schemas.FeedbackCreate,
    credentials: HTTPAuthorizationCredentials = Depends(auth.security),
    db: Session = Depends(get_db)
):
    current_user = auth.get_current_user(db, credentials)
    if current_user.role != models.UserRole.MANAGER:
        raise HTTPException(status_code=403, detail="Only managers can create feedback")
    
    # Verify the employee is in the manager's team
    team_members = crud.get_team_members(db, current_user.id)
    employee_ids = [member.id for member in team_members]
    if feedback.employee_id not in employee_ids:
        raise HTTPException(status_code=403, detail="Can only provide feedback to team members")
    
    return crud.create_feedback(db=db, feedback=feedback, manager_id=current_user.id)

@app.get("/feedback", response_model=List[schemas.Feedback])
def get_feedback(
    employee_id: int = None,
    credentials: HTTPAuthorizationCredentials = Depends(auth.security),
    db: Session = Depends(get_db)
):
    current_user = auth.get_current_user(db, credentials)
    
    if current_user.role == models.UserRole.MANAGER:
        if employee_id:
            # Manager viewing specific employee's feedback
            team_members = crud.get_team_members(db, current_user.id)
            employee_ids = [member.id for member in team_members]
            if employee_id not in employee_ids:
                raise HTTPException(status_code=403, detail="Can only view team member feedback")
            return crud.get_feedback_by_employee(db, employee_id)
        else:
            # Manager viewing all feedback they've given
            return crud.get_feedback_by_manager(db, current_user.id)
    else:
        # Employee viewing their own feedback
        if employee_id and employee_id != current_user.id:
            raise HTTPException(status_code=403, detail="Can only view your own feedback")
        return crud.get_feedback_by_employee(db, current_user.id)

@app.put("/feedback/{feedback_id}", response_model=schemas.Feedback)
def update_feedback(
    feedback_id: int,
    feedback_update: schemas.FeedbackUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(auth.security),
    db: Session = Depends(get_db)
):
    current_user = auth.get_current_user(db, credentials)
    if current_user.role != models.UserRole.MANAGER:
        raise HTTPException(status_code=403, detail="Only managers can update feedback")
    
    # Verify the feedback belongs to the current manager
    feedback = crud.get_feedback(db, feedback_id)
    if not feedback or feedback.manager_id != current_user.id:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    return crud.update_feedback(db, feedback_id, feedback_update)

@app.delete("/feedback/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_feedback_endpoint(
    feedback_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(auth.security),
    db: Session = Depends(get_db)
):
    current_user = auth.get_current_user(db, credentials)
    if current_user.role != models.UserRole.MANAGER:
        raise HTTPException(status_code=403, detail="Only managers can delete feedback")

    feedback_to_delete = crud.get_feedback(db, feedback_id)

    if not feedback_to_delete:
        raise HTTPException(status_code=404, detail="Feedback not found")

    if feedback_to_delete.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete feedback you have created")

    crud.delete_feedback(db, feedback_id)
    return

@app.post("/feedback/{feedback_id}/acknowledge", response_model=schemas.Feedback)
def acknowledge_feedback(
    feedback_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(auth.security),
    db: Session = Depends(get_db)
):
    current_user = auth.get_current_user(db, credentials)
    if current_user.role != models.UserRole.EMPLOYEE:
        raise HTTPException(status_code=403, detail="Only employees can acknowledge feedback")
    
    return crud.acknowledge_feedback(db, feedback_id, current_user.id)

# Dashboard endpoints
@app.get("/dashboard/manager", response_model=schemas.ManagerDashboard)
def get_manager_dashboard(
    credentials: HTTPAuthorizationCredentials = Depends(auth.security),
    db: Session = Depends(get_db)
):
    current_user = auth.get_current_user(db, credentials)
    if current_user.role != models.UserRole.MANAGER:
        raise HTTPException(status_code=403, detail="Only managers can access manager dashboard")
    
    return crud.get_manager_dashboard_data(db, current_user.id)

@app.get("/dashboard/employee", response_model=schemas.EmployeeDashboard)
def get_employee_dashboard(
    credentials: HTTPAuthorizationCredentials = Depends(auth.security),
    db: Session = Depends(get_db)
):
    current_user = auth.get_current_user(db, credentials)
    if current_user.role != models.UserRole.EMPLOYEE:
        raise HTTPException(status_code=403, detail="Only employees can access employee dashboard")
    
    return crud.get_employee_dashboard_data(db, current_user.id)

# Health check
@app.get("/health")
def health_check():
    return {"status": "healthy"} 