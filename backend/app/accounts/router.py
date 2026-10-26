from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.accounts.dependencies import CurrentUser
from app.accounts.models import User, UserSession
from app.accounts.schemas import (
    LoginRequest,
    NicknameUpdateRequest,
    SignupRequest,
    UserResponse,
)
from app.accounts.security import (
    create_session_token,
    hash_password,
    hash_session_token,
    session_expiry,
    verify_password,
)
from app.db.session import get_db


router = APIRouter(prefix="/api/auth", tags=["accounts"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: DatabaseSession) -> User:
    duplicate = db.scalar(
        select(User).where(or_(User.email == str(payload.email), User.nickname == payload.nickname))
    )
    if duplicate is not None:
        message = (
            "이미 사용 중인 이메일입니다."
            if duplicate.email == str(payload.email)
            else "이미 사용 중인 닉네임입니다."
        )
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=message)

    user = User(
        email=str(payload.email),
        nickname=payload.nickname,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="이미 사용 중인 이메일 또는 닉네임입니다.",
        ) from error
    db.refresh(user)
    return user


@router.post("/login", response_model=UserResponse)
def login(payload: LoginRequest, request: Request, response: Response, db: DatabaseSession) -> User:
    user = db.scalar(select(User).where(User.email == str(payload.email)))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 맞지 않습니다.",
        )

    settings = request.app.state.settings
    token = create_session_token()
    db.add(
        UserSession(
            token_hash=hash_session_token(token),
            user=user,
            expires_at=session_expiry(settings.session_lifetime_days),
        )
    )
    db.commit()
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        max_age=settings.session_lifetime_days * 24 * 60 * 60,
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite="lax",
        path="/",
    )
    return user


@router.get("/me", response_model=UserResponse)
def me(current_user: CurrentUser) -> User:
    return current_user


@router.patch("/me/nickname", response_model=UserResponse)
def update_nickname(
    payload: NicknameUpdateRequest,
    current_user: CurrentUser,
    db: DatabaseSession,
) -> User:
    duplicate = db.scalar(
        select(User).where(User.nickname == payload.nickname, User.id != current_user.id)
    )
    if duplicate is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="이미 사용 중인 닉네임입니다."
        )
    current_user.nickname = payload.nickname
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="이미 사용 중인 닉네임입니다."
        ) from error
    db.refresh(current_user)
    return current_user
