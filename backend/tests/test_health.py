import asyncio
from pathlib import Path

from httpx import ASGITransport, AsyncClient

from app.core.config import PROJECT_ROOT, Settings
from app.main import create_app


def request(method, path, *, settings=None, **kwargs):
    async def send():
        app = create_app(settings if settings is not None else Settings(_env_file=None))
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://testserver"
        ) as client:
            return await client.request(method, path, **kwargs)

    return asyncio.run(send())


def test_health_contains_only_public_service_status():
    response = request("GET", "/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "BuildLog API"}


def test_local_frontend_is_allowed_by_cors():
    response = request(
        "OPTIONS", "/api/health",
        headers={
            "Origin": "http://127.0.0.1:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:5173"
    assert response.headers["access-control-allow-credentials"] == "true"


def test_unconfigured_origin_is_not_allowed():
    response = request(
        "OPTIONS", "/api/health",
        headers={
            "Origin": "https://untrusted.example",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers


def test_settings_read_environment_without_exposing_database_url(monkeypatch):
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("DATABASE_URL", "sqlite:///test-only.sqlite3")
    monkeypatch.setenv("CORS_ORIGINS", '["http://127.0.0.1:9999"]')
    settings = Settings(_env_file=None)
    assert settings.app_env == "test"
    assert settings.database_url == "sqlite:///test-only.sqlite3"
    response = request("GET", "/api/health", settings=settings)
    assert "sqlite" not in response.text


def test_default_database_path_is_absolute_and_independent_of_cwd(tmp_path, monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.chdir(tmp_path)
    settings = Settings(_env_file=None)
    path = Path(settings.database_url.removeprefix("sqlite:///"))
    assert path.is_absolute()
    assert path == PROJECT_ROOT / "database" / "buildlog.sqlite3"
