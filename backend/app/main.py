from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from app.config import settings
from app.database import init_db, close_db
from app.api.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="BluePrint AI - Execution Engine",
    description="AI-powered product discovery and execution planning API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


@app.get("/")
async def root():
    return RedirectResponse(url="/api/v1/health")

EXECUTION_PLAN_TEMPLATE = """You are a strategic product planning assistant. Based on the concept provided, produce:
1. Deconstruct the problem into Jobs-to-be-Done stories (role, situation, motivation, outcome)
2. A basic Mom Test validation plan
3. Identify assumptions across desirability, viability, feasibility, and usability
4. Propose a 30/60/90-day phased execution roadmap
5. Flag governance issues if any
"""
