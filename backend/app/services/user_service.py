from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.models.leaderboard import Leaderboard
from app.schemas.user import UserCreate
from app.core.security import hash_password, verify_password

class UserService:
    @staticmethod
    def get_by_username(db: Session, username: str) -> User | None:
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def create_user(db: Session, user_in: UserCreate, is_admin: bool = False) -> User:
        if UserService.get_by_username(db, user_in.username):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already registered"
            )
        if UserService.get_by_email(db, user_in.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email address already registered"
            )

        db_user = User(
            username=user_in.username,
            email=user_in.email,
            password_hash=hash_password(user_in.password),
            role=UserRole.ADMIN if is_admin else UserRole.USER,
            is_active=True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        # Initialize Leaderboard entry for new user
        leaderboard_entry = Leaderboard(user_id=db_user.id)
        db.add(leaderboard_entry)
        db.commit()

        return db_user

    @staticmethod
    def authenticate(db: Session, username_or_email: str, password: str) -> User | None:
        user = UserService.get_by_username(db, username_or_email)
        if not user:
            user = UserService.get_by_email(db, username_or_email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

user_service = UserService()
