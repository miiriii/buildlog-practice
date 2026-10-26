import asyncio

from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from app.accounts.models import User
from app.accounts.security import verify_password
from app.core.config import Settings
from app.db.base import Base
from app.main import create_app


def make_settings(tmp_path):
    return Settings(
        _env_file=None,
        app_env="test",
        database_url=f"sqlite:///{(tmp_path / 'accounts.sqlite3').as_posix()}",
    )


def run_scenario(tmp_path, scenario):
    async def run():
        app = create_app(make_settings(tmp_path))
        Base.metadata.create_all(app.state.engine)
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://testserver"
        ) as client:
            await scenario(client, app)
        app.state.engine.dispose()

    asyncio.run(run())


def signup_payload(**overrides):
    payload = {
        "email": "learner@example.com",
        "password": "password123",
        "nickname": "학습자_1",
    }
    payload.update(overrides)
    return payload


def test_signup_normalizes_fields_and_hashes_password(tmp_path):
    async def scenario(client, app):
        response = await client.post(
            "/api/auth/signup",
            json=signup_payload(email="  Learner@Example.com  ", nickname="  학습자_1  "),
        )
        assert response.status_code == 201
        assert response.json()["email"] == "learner@example.com"
        assert response.json()["nickname"] == "학습자_1"
        assert "password" not in response.text

        with app.state.session_factory() as db:
            user = db.scalar(select(User))
            assert user.password_hash != "password123"
            assert verify_password("password123", user.password_hash)

    run_scenario(tmp_path, scenario)


def test_duplicate_email_and_nickname_are_rejected(tmp_path):
    async def scenario(client, app):
        assert (await client.post("/api/auth/signup", json=signup_payload())).status_code == 201
        duplicate_email = await client.post(
            "/api/auth/signup", json=signup_payload(nickname="다른이름")
        )
        duplicate_nickname = await client.post(
            "/api/auth/signup",
            json=signup_payload(email="other@example.com"),
        )
        assert duplicate_email.status_code == 409
        assert duplicate_email.json()["detail"] == "이미 사용 중인 이메일입니다."
        assert duplicate_nickname.status_code == 409
        assert duplicate_nickname.json()["detail"] == "이미 사용 중인 닉네임입니다."

    run_scenario(tmp_path, scenario)


def test_signup_validation_boundaries(tmp_path):
    async def scenario(client, _app):
        valid_short = await client.post(
            "/api/auth/signup",
            json=signup_payload(email="short@example.com", password="12345678", nickname="가나"),
        )
        valid_long = await client.post(
            "/api/auth/signup",
            json=signup_payload(
                email="long@example.com", password="p" * 64, nickname="가" * 20
            ),
        )
        assert valid_short.status_code == 201
        assert valid_long.status_code == 201

        cases = [
            signup_payload(email="not-an-email"),
            signup_payload(email="p7@example.com", password="p" * 7, nickname="닉네임7"),
            signup_payload(email="p65@example.com", password="p" * 65, nickname="닉네임65"),
            signup_payload(email="n1@example.com", nickname="가"),
            signup_payload(email="n21@example.com", nickname="가" * 21),
            signup_payload(email="symbol@example.com", nickname="학습자!"),
        ]
        for payload in cases:
            assert (await client.post("/api/auth/signup", json=payload)).status_code == 422

    run_scenario(tmp_path, scenario)


def test_login_cookie_and_current_user(tmp_path):
    async def scenario(client, _app):
        await client.post("/api/auth/signup", json=signup_payload())
        wrong = await client.post(
            "/api/auth/login",
            json={"email": "learner@example.com", "password": "wrong-password"},
        )
        assert wrong.status_code == 401
        assert wrong.json()["detail"] == "이메일 또는 비밀번호가 맞지 않습니다."

        login = await client.post(
            "/api/auth/login",
            json={"email": "  LEARNER@example.com ", "password": "password123"},
        )
        assert login.status_code == 200
        cookie = login.headers["set-cookie"]
        assert "HttpOnly" in cookie
        assert "SameSite=lax" in cookie
        assert "password123" not in cookie

        me = await client.get("/api/auth/me")
        assert me.status_code == 200
        assert me.json()["nickname"] == "학습자_1"

    run_scenario(tmp_path, scenario)


def test_unauthenticated_access_and_nickname_permissions(tmp_path):
    async def scenario(client, _app):
        assert (await client.get("/api/auth/me")).status_code == 401
        assert (
            await client.patch("/api/auth/me/nickname", json={"nickname": "새이름"})
        ).status_code == 401

    run_scenario(tmp_path, scenario)


def test_nickname_update_validates_and_only_changes_current_user(tmp_path):
    async def scenario(client, app):
        await client.post("/api/auth/signup", json=signup_payload())
        await client.post(
            "/api/auth/signup",
            json=signup_payload(email="other@example.com", nickname="다른사용자"),
        )
        await client.post(
            "/api/auth/login",
            json={"email": "learner@example.com", "password": "password123"},
        )

        duplicate = await client.patch(
            "/api/auth/me/nickname", json={"nickname": "다른사용자"}
        )
        invalid = await client.patch(
            "/api/auth/me/nickname", json={"nickname": "잘못된 이름"}
        )
        updated = await client.patch(
            "/api/auth/me/nickname", json={"nickname": " 새닉네임_2 "}
        )
        assert duplicate.status_code == 409
        assert invalid.status_code == 422
        assert updated.status_code == 200
        assert updated.json()["nickname"] == "새닉네임_2"

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://testserver"
        ) as other_login:
            response = await other_login.post(
                "/api/auth/login",
                json={"email": "other@example.com", "password": "password123"},
            )
            assert response.status_code == 200
            assert (await other_login.get("/api/auth/me")).json()["nickname"] == "다른사용자"

    run_scenario(tmp_path, scenario)


def test_user_data_survives_app_restart(tmp_path):
    settings = make_settings(tmp_path)

    async def first_run():
        app = create_app(settings)
        Base.metadata.create_all(app.state.engine)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
            assert (await client.post("/api/auth/signup", json=signup_payload())).status_code == 201
        app.state.engine.dispose()

    async def second_run():
        app = create_app(settings)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
            response = await client.post(
                "/api/auth/login",
                json={"email": "learner@example.com", "password": "password123"},
            )
            assert response.status_code == 200
        app.state.engine.dispose()

    asyncio.run(first_run())
    asyncio.run(second_run())
