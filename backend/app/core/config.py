from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=PROJECT_ROOT / "backend" / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = "development"
    database_url: str = Field(
        default_factory=lambda: (
            f"sqlite:///{(PROJECT_ROOT / 'database' / 'buildlog.sqlite3').as_posix()}"
        )
    )
    cors_origins: list[str] = ["http://127.0.0.1:5173", "http://localhost:5173"]
