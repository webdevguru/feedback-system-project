from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, User, UserRole
from app.auth import get_password_hash

def init_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if users already exist
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("Database already initialized with users")
            return
        
        # Create sample manager
        manager = User(
            name="John Manager",
            email="john.manager@company.com",
            password_hash=get_password_hash("manager123"),
            role=UserRole.MANAGER
        )
        db.add(manager)
        db.commit()
        db.refresh(manager)
        
        # Create sample employees
        employees = [
            User(
                name="Alice Employee",
                email="alice.employee@company.com",
                password_hash=get_password_hash("employee123"),
                role=UserRole.EMPLOYEE,
                manager_id=manager.id
            ),
            User(
                name="Bob Employee",
                email="bob.employee@company.com",
                password_hash=get_password_hash("employee123"),
                role=UserRole.EMPLOYEE,
                manager_id=manager.id
            ),
            User(
                name="Carol Employee",
                email="carol.employee@company.com",
                password_hash=get_password_hash("employee123"),
                role=UserRole.EMPLOYEE,
                manager_id=manager.id
            )
        ]
        
        for employee in employees:
            db.add(employee)
        
        db.commit()
        print("Database initialized with sample users:")
        print("Manager: john.manager@company.com / manager123")
        print("Employees: alice.employee@company.com / employee123")
        print("          bob.employee@company.com / employee123")
        print("          carol.employee@company.com / employee123")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 