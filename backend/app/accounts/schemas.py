import re

from pydantic import BaseModel, EmailStr, field_validator


NICKNAME_PATTERN = re.compile(r"^[가-힣A-Za-z0-9_]+$")


def validate_nickname(value: str) -> str:
    value = value.strip()
    if not 2 <= len(value) <= 20:
        raise ValueError("닉네임은 2~20자로 입력해 주세요.")
    if not NICKNAME_PATTERN.fullmatch(value):
        raise ValueError("닉네임에는 한글, 영문, 숫자, 밑줄만 사용할 수 있습니다.")
    return value


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    nickname: str

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value):
        return value.strip().lower() if isinstance(value, str) else value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not 8 <= len(value) <= 64:
            raise ValueError("비밀번호는 8~64자로 입력해 주세요.")
        return value

    @field_validator("nickname")
    @classmethod
    def normalize_nickname(cls, value: str) -> str:
        return validate_nickname(value)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value):
        return value.strip().lower() if isinstance(value, str) else value


class NicknameUpdateRequest(BaseModel):
    nickname: str

    @field_validator("nickname")
    @classmethod
    def normalize_nickname(cls, value: str) -> str:
        return validate_nickname(value)


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    nickname: str
    is_admin: bool

    model_config = {"from_attributes": True}
