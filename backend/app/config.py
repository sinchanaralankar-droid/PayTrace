from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent

class Settings(BaseSettings):
    PAYPAL_CLIENT_ID: str = ""
    PAYPAL_CLIENT_SECRET: str = ""
    PAYPAL_BASE_URL: str = "https://api-m.sandbox.paypal.com"

    GOOGLE_API_KEY: str = ""
    GOOGLE_GENAI_MODEL: str = "gemini-3.5-flash"
    GOOGLE_GENAI_USE_ENTERPRISE: int = 0

    DATABASE_PATH: Path = BASE_DIR / "paytrace.db"
    
    APP_NAME: str = "PayTrace - Ship or Hold?"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ALLOW_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

    model_config = SettingsConfigDict(
        env_file=(
            BASE_DIR / ".env",
            PROJECT_ROOT / "paytrace" / ".env",
            PROJECT_ROOT / ".env"
        ),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def has_paypal_credentials(self) -> bool:
        return bool(self.PAYPAL_CLIENT_ID and self.PAYPAL_CLIENT_SECRET)

    @property
    def has_gemini_credentials(self) -> bool:
        return bool(self.GOOGLE_API_KEY)


settings = Settings()
