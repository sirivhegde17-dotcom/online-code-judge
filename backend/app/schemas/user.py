from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from app.models.user import UserRole

# Base User Properties
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

# Properties to receive via registration
class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)

# Properties to receive via login
class UserLogin(BaseModel):
    username_or_email: str
    password: str

# User Response Schema
class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# User Profile Update
class UserUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None
