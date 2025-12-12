"""User schemas for API requests/responses."""
from pydantic import BaseModel


class UserBase(BaseModel):
    """Base user schema."""
    username: str


class UserCreate(UserBase):
    """Schema for user creation."""
    password: str


class UserLogin(BaseModel):
    """Schema for user login."""
    username: str
    password: str


class User(UserBase):
    """User response schema."""
    id: int
    role: str
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
