from contextlib import asynccontextmanager
from typing import Literal

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.accounts.router import router as accounts_router
from app.core.config import Settings
from app.db.session import create_database_engine, create_session_factory


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: Literal["BuildLog API"]


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings if settings is not None else Settings()
    engine = create_database_engine(settings.database_url)

    @asynccontextmanager
    async def lifespan(_app: FastAPI):
        yield
        engine.dispose()

    app = FastAPI(title="BuildLog API", version="0.2.0", lifespan=lifespan)
    app.state.settings = settings
    app.state.engine = engine
    app.state.session_factory = create_session_factory(engine)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH"],
        allow_headers=["Accept", "Content-Type"],
    )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(_request, exc: RequestValidationError):
        first_error = exc.errors()[0] if exc.errors() else None
        message = first_error.get("ctx", {}).get("error") if first_error else None
        if isinstance(message, ValueError):
            message = str(message)
        if not message:
            field = first_error.get("loc", [""])[-1] if first_error else ""
            message = {
                "email": "올바른 이메일을 입력해 주세요.",
                "password": "비밀번호를 확인해 주세요.",
                "nickname": "닉네임을 확인해 주세요.",
            }.get(field, "입력한 내용을 확인해 주세요.")
        return JSONResponse(status_code=422, content={"detail": str(message)})

    @app.get("/api/health", response_model=HealthResponse, tags=["health"])
    def health() -> HealthResponse:
        # Process health only: no database connection or secret settings exposed.
        return HealthResponse(status="ok", service="BuildLog API")

    app.include_router(accounts_router)

    return app


app = create_app()
