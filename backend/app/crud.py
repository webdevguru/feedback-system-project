from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from . import models, schemas
from .auth import get_password_hash

# User CRUD operations
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreateInternal):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        role=user.role,
        manager_id=user.manager_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_team_members(db: Session, manager_id: int):
    return db.query(models.User).filter(models.User.manager_id == manager_id).all()

# Feedback CRUD operations
def get_feedback(db: Session, feedback_id: int):
    return db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()

def get_feedback_by_employee(db: Session, employee_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Feedback).filter(
        models.Feedback.employee_id == employee_id
    ).order_by(models.Feedback.created_at.desc()).offset(skip).limit(limit).all()

def get_feedback_by_manager(db: Session, manager_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Feedback).filter(
        models.Feedback.manager_id == manager_id
    ).order_by(models.Feedback.created_at.desc()).offset(skip).limit(limit).all()

def create_feedback(db: Session, feedback: schemas.FeedbackCreate, manager_id: int):
    db_feedback = models.Feedback(
        **feedback.dict(),
        manager_id=manager_id
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

def update_feedback(db: Session, feedback_id: int, feedback_update: schemas.FeedbackUpdate):
    db_feedback = get_feedback(db, feedback_id)
    if not db_feedback:
        return None
    
    update_data = feedback_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_feedback, field, value)
    
    db_feedback.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

def acknowledge_feedback(db: Session, feedback_id: int, employee_id: int):
    db_feedback = get_feedback(db, feedback_id)
    if not db_feedback or db_feedback.employee_id != employee_id:
        return None
    
    db_feedback.acknowledged = True
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

def delete_feedback(db: Session, feedback_id: int):
    db_feedback = get_feedback(db, feedback_id)
    if db_feedback:
        db.delete(db_feedback)
        db.commit()
    return db_feedback

# Dashboard data
def get_manager_dashboard_data(db: Session, manager_id: int):
    team_members_models = get_team_members(db, manager_id)
    # Get team members with feedback counts
    team_members = db.query(
        models.User.id,
        models.User.name,
        models.User.email,
        func.count(models.Feedback.id).label('feedback_count'),
        func.max(models.Feedback.created_at).label('last_feedback_date')
    ).outerjoin(models.Feedback, models.User.id == models.Feedback.employee_id)\
     .filter(models.User.manager_id == manager_id)\
     .group_by(models.User.id, models.User.name, models.User.email)\
     .all()
    
    # Get sentiment distribution
    sentiment_distribution = db.query(
        models.Feedback.sentiment,
        func.count(models.Feedback.id)
    ).filter(models.Feedback.manager_id == manager_id)\
     .group_by(models.Feedback.sentiment)\
     .all()
    
    # Convert to dict
    sentiment_dict = {sentiment.value: count for sentiment, count in sentiment_distribution}
    
    # Total feedback count
    total_feedback = db.query(func.count(models.Feedback.id))\
                      .filter(models.Feedback.manager_id == manager_id)\
                      .scalar()
    
    return {
        "team_members": [
            {
                "id": member.id,
                "name": member.name,
                "email": member.email,
                "feedback_count": member.feedback_count,
                "last_feedback_date": member.last_feedback_date
            } for member in team_members
        ],
        "total_feedback_count": total_feedback,
        "sentiment_distribution": sentiment_dict
    }

def get_employee_dashboard_data(db: Session, employee_id: int):
    # Get feedback timeline
    feedback_timeline = get_feedback_by_employee(db, employee_id)
    
    # Count unacknowledged feedback
    unacknowledged_count = db.query(func.count(models.Feedback.id))\
                            .filter(
                                models.Feedback.employee_id == employee_id,
                                models.Feedback.acknowledged == False
                            ).scalar()
    
    return {
        "feedback_timeline": feedback_timeline,
        "unacknowledged_count": unacknowledged_count
    } 