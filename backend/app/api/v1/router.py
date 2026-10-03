from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.problems import router as problems_router
from app.api.v1.code import router as code_router
from app.api.v1.submissions import router as submissions_router
from app.api.v1.leaderboard import router as leaderboard_router
from app.api.v1.admin import router as admin_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(problems_router)
api_router.include_router(code_router)
api_router.include_router(submissions_router)
api_router.include_router(leaderboard_router)
api_router.include_router(admin_router)
