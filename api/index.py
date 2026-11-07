import sys
import os
from pathlib import Path

# Add backend directory to sys.path
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

os.environ["VERCEL"] = "1"
os.environ.setdefault("DATABASE_PATH", "/tmp/paytrace.db")

from app.main import app
