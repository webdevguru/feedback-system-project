from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .models import UserRole, Sentiment

# User schemas
class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str

class UserCreateInternal(UserCreate):
    role: UserRole
    manager_id: Optional[int] = None

class User(UserBase):
    id: int
    role: UserRole
    manager_id: Optional[int] = None

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

# Feedback schemas
class FeedbackBase(BaseModel):
    strengths: Optional[str] = None
    areas_to_improve: Optional[str] = None
    sentiment: Sentiment

class FeedbackCreate(FeedbackBase):
    employee_id: int

class FeedbackUpdate(BaseModel):
    strengths: Optional[str] = None
    areas_to_improve: Optional[str] = None
    sentiment: Optional[Sentiment] = None

class Feedback(FeedbackBase):
    id: int
    employee_id: int
    manager_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    acknowledged: bool

    class Config:
        from_attributes = True

# Dashboard schemas
class TeamMember(BaseModel):
    id: int
    name: str
    email: str
    feedback_count: int
    last_feedback_date: Optional[datetime] = None

class ManagerDashboard(BaseModel):
    team_members: List[TeamMember]
    total_feedback_count: int
    sentiment_distribution: dict

class EmployeeDashboard(BaseModel):
    feedback_timeline: List[Feedback]
    unacknowledged_count: int 