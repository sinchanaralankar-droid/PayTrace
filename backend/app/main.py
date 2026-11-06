import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.database import init_db
from app.database.seed_data import seed_database
from app.api.endpoints import router as api_router
from agents.root_agent import root_orchestrator

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database & seed demonstration cases
    print("Initializing PayTrace database...")
    init_db()
    print("Seeding canonical demonstration orders...")
    seed_database()
    
    # Pre-verify demonstration cases on startup so dashboard opens with rich evidence
    print("Running initial agent verifications for demonstration cases...")
    for oid in ["ORD-1001", "ORD-1002", "ORD-1003", "ORD-1004", "ORD-1005", "ORD-1006"]:
        try:
            await root_orchestrator.run(oid)
        except Exception as e:
            print(f"Initial verification notice for {oid}: {e}")

    print("PayTrace backend is fully initialized and ready.")
    yield
    print("Shutting down PayTrace backend.")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered PayPal payment verification and shipment decision platform (Ship, Hold, or Ask).",
    lifespan=lifespan
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
