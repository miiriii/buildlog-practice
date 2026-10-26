from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect

from app.core.config import PROJECT_ROOT


def test_initial_migration_builds_empty_sqlite_database(tmp_path, monkeypatch):
    database_path = tmp_path / "migration.sqlite3"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{database_path.as_posix()}")
    config = Config(PROJECT_ROOT / "backend" / "alembic.ini")
    command.upgrade(config, "head")

    inspector = inspect(create_engine(f"sqlite:///{database_path.as_posix()}"))
    assert {"alembic_version", "users", "user_sessions"}.issubset(
        set(inspector.get_table_names())
    )
    assert any(item["unique"] for item in inspector.get_indexes("users") if item["name"] == "ix_users_email")
