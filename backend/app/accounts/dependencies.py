from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.accounts.models import User, UserSession
from app.accounts.security import hash_session_token, utc_now
from app.db.session import get_db


def get_current_user(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    session_token: Annotated[str | None, Cookie(alias="buildlog_session")] = None,
) -> User:
    cookie_name = request.app.state.settings.session_cookie_name
    if cookie_name != "buildlog_session":
        session_token = request.cookies.get(cookie_name)
    if not session_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="로그인이 필요합니다.")

    user_session = db.scalar(
        select(UserSession).where(UserSession.token_hash == hash_session_token(session_token))
    )
    if user_session is None or user_session.expires_at <= utc_now():
        if user_session is not None:
            db.delete(user_session)
            db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="로그인이 필요합니다.")
    return user_session.user


CurrentUser = Annotated[User, Depends(get_current_user)]
