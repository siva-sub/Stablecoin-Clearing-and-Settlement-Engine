from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown

app = FastAPI(
    title="SCSE API",
    description="Stablecoin Clearing & Settlement Engine",
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
from src.api.routes import router as api_router

app.include_router(api_router)
app.mount("/dashboard", StaticFiles(directory="docs", html=True), name="dashboard")

@app.get("/")
async def root():
    return {"message": "SCSE is running", "status": "OK"}
