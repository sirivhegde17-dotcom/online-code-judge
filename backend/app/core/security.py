from datetime import datetime, timedelta
from typing import Optional, Any
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a raw password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a raw password against the stored bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(subject: Any, expires_delta: Optional[timedelta] = None) -> str:
    """Generate a JWT access token for a given user identifier/subject."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt
