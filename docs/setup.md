# BuildLog 개발 환경과 Phase 0 점검 결과

점검일: 2026-10-26 (한국 시간)

## 1. 현재 상태

Phase 0의 문서 검토와 환경 점검을 수행했습니다. 개발에 사용할 도구는 실행 가능하지만 회원 인증 담당이 미정이므로 Phase 0의 전체 완료 조건은 아직 충족하지 않았습니다. Phase 1은 시작하지 않았습니다.

수행한 작업은 문서 수정, 로컬 도구 버전 조회, 공식 문서·패키지 배포 정보 확인입니다. 패키지 설치, 가상환경 생성, 서비스 코드 작성, DB 파일 생성, Supabase 프로젝트 생성·접속, Git 초기화·커밋은 하지 않았습니다.

## 2. 확정한 기술 구성

| 구분 | 사용 기술 |
| --- | --- |
| 프론트엔드 | React |
| 백엔드 | Python, FastAPI |
| 초기 개발·테스트 DB | SQLite3 |
| 운영 DB | Supabase의 PostgreSQL |

기록 데이터의 기본 흐름은 React → FastAPI → DB입니다. 회원 인증 담당은 별도 결정합니다. 운영자 신고 확인은 React 화면과 운영자 전용 FastAPI API로 구현합니다.

`PRD.md`, `spec.md`, `plan.md`에서 기존 Django 관련 구조를 제거하고 새 구성을 반영했습니다. `mvp.md`에도 기술 확정 사항을 반영했습니다. 기존 `docs/README.md`는 수정하지 않았습니다.

## 3. 로컬 환경 점검

| 확인 항목 | 실제 확인 결과 | 판정 |
| --- | --- | --- |
| Python | 3.13.14, 64비트 | 실행 가능 |
| Python 경로 | `C:\Users\aicam\AppData\Local\Programs\Python\Python313\python.exe` | 확인 |
| Python 내장 SQLite | 3.50.4 | import 및 버전 조회 성공 |
| pip | 26.1.2 | `python -B -m pip --version` 성공 |
| Node.js | 24.22.1 | 실행 가능 |
| npm | 11.19.1 | `npm.cmd --version` 성공 |
| PowerShell의 `npm` | `npm.ps1` 실행이 실행 정책으로 차단됨 | `npm.cmd`로 실행 가능 |
| FastAPI·Uvicorn·SQLAlchemy·Alembic·pytest | 조회한 Python 환경에 설치되지 않음 | Phase 1 이후 필요한 단계에서 설치 |
| 8000·5173 포트 | 점검 시점에 수신 중인 항목 없음 | 주소 후보로 사용 가능 |
| backend·frontend·database | 점검 시 내부 파일 없음 | 기존 구현 없음 |

PowerShell 실행 정책은 변경하지 않았습니다. 이후 npm 명령은 `npm.cmd`를 사용합니다. 시스템 Python에 설치하지 않고 `backend/.venv`에 백엔드 환경을 격리할 예정입니다. 포트 사용 여부는 실제 실행 시 다시 확인합니다.

## 4. 버전 및 도구 검토 결과

아래는 점검 시 공식 패키지 레지스트리에서 조회한 설치 후보입니다. 설치하거나 함께 실행해 검증한 결과가 아닙니다. Phase 1에서 의존성을 확인한 뒤 정확한 버전을 고정합니다.

| 도구 | 조회한 버전 | 게시된 실행 조건 |
| --- | --- | --- |
| FastAPI | 0.162.0 | Python 3.10 이상 |
| Uvicorn | 0.54.0 | Python 3.10 이상 |
| Pydantic | 2.14.1 | Python 3.10 이상 |
| SQLAlchemy | 2.1.6 | Python 3.11 이상 |
| Alembic | 1.20.1 | Python 3.10 이상 |
| pytest | 9.1.1 | Python 3.10 이상 |
| Psycopg | 3.3.6 | Python 3.10 이상 |
| React | 19.3.1 | React DOM과 같은 버전으로 구성 예정 |
| Vite | 8.3.5 | Node.js `^20.19.0 || >=22.12.0` |

현재 Python과 Node.js는 위에 게시된 최소 버전 조건에 들어갑니다. 실제 의존성 해결, Windows용 패키지 설치 및 프론트 빌드는 Phase 1 이후에 확인합니다. 새 Python이나 Node.js 설치가 필요하다는 근거는 현재 없습니다.

구현용 도구 후보는 SQLAlchemy(DB 모델·조회), Alembic(DB 구조 변경 이력), Vite(React 개발·빌드), pytest(API·모델 테스트)입니다. PostgreSQL 드라이버 후보는 Psycopg이며 실제 Supabase 연결 방식에 맞춰 확정합니다. 이 선택은 사용자 기능을 추가하지 않습니다. 인증 라이브러리는 인증 담당 결정 후 선정합니다.

SQLAlchemy는 SQLite와 PostgreSQL을 지원하지만 DB마다 제약과 동작 차이가 있으므로 Supabase 통합 검증을 별도로 수행합니다. SQLite의 외래키 적용, 시간 저장, 중복·단일 대상 제약을 명시적으로 검사할 계획입니다.

확인 자료:

- [FastAPI 관계형 데이터베이스 안내](https://fastapi.tiangolo.com/tutorial/sql-databases/)
- [SQLAlchemy 지원 DB 안내](https://www.sqlalchemy.org/features.html)
- [SQLAlchemy SQLite 동작 안내](https://docs.sqlalchemy.org/en/20/dialects/sqlite.html)
- [Vite 실행 환경 안내](https://vite.dev/guide/)
- [Supabase PostgreSQL 연결 안내](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase Auth 구조](https://supabase.com/docs/guides/auth/architecture)
- Python 패키지 버전과 Python 조건: [PyPI FastAPI 메타데이터](https://pypi.org/pypi/fastapi/json), [Uvicorn](https://pypi.org/pypi/uvicorn/json), [Pydantic](https://pypi.org/pypi/pydantic/json), [SQLAlchemy](https://pypi.org/pypi/SQLAlchemy/json), [Alembic](https://pypi.org/pypi/alembic/json), [pytest](https://pypi.org/pypi/pytest/json), [Psycopg](https://pypi.org/pypi/psycopg/json)
- 프론트 패키지 메타데이터: [React](https://registry.npmjs.org/react/latest), [Vite](https://registry.npmjs.org/vite/latest)

## 5. 실행 설정안

아래는 Phase 1에서 적용할 로컬 기본값입니다. 아직 설정 파일이나 환경 변수를 만들지 않았습니다.

| 항목 | 예정 값 또는 역할 |
| --- | --- |
| 백엔드 주소 | `http://127.0.0.1:8000` |
| 프론트 주소 | `http://127.0.0.1:5173` |
| 가상환경 | `backend/.venv` |
| 로컬 수동 확인 DB | `database/buildlog.sqlite3` |
| 자동 테스트 DB | 테스트마다 격리된 임시 SQLite3 DB |
| 운영 DB | Supabase PostgreSQL, 연결 설정 미정 |
| 백엔드 `APP_ENV` | 실행 환경 구분 |
| 백엔드 `DATABASE_URL` | SQLite3 또는 Supabase DB 연결 주소 |
| 백엔드 `CORS_ORIGINS` | 허용할 React 주소, 로컬에서는 위 프론트 주소 |
| 프론트 `VITE_API_BASE_URL` | 공개 가능한 FastAPI 주소 |

로컬 SQLite 연결 URL은 실행 위치에 따라 다른 파일을 만들지 않도록 프로젝트 기준 절대 경로로 변환합니다. 비밀번호·DB 연결 문자열·서버 비밀키는 프론트 환경 변수에 넣지 않습니다. 인증용 비밀키와 Supabase Auth 관련 항목은 인증 방식 결정 후 추가합니다. `.env.example`은 실제 비밀값 없이 항목을 공유합니다.

`.gitignore`에는 현재 `.env`, `.env.*`, `.venv/`, `node_modules/`, `dist/`, `__pycache__/`, 로그 제외 및 `.env.example` 예외가 있습니다. SQLite3 파일, DB 부속 파일과 테스트 생성물 제외 규칙은 아직 없으며, 계획대로 Phase 1에서 필요한 부분만 보완합니다. Phase 0에서는 `.gitignore`를 수정하지 않았습니다.

## 6. 문서 검토 결과와 남은 결정

### 6.1. 회원 인증 담당 — 결정 필요

| 선택 | 개발에 미치는 영향 |
| --- | --- |
| FastAPI에서 회원·로그인 관리 | SQLite3만으로 초기 회원 기능을 개발·테스트하고, 이후 DB를 Supabase로 연결할 수 있습니다. 비밀번호 해시와 로그인 상태를 백엔드에서 관리합니다. |
| Supabase Auth에서 관리 | 앱 회원 정보와 Supabase 사용자 ID를 연결합니다. 초기 회원 연동 단계부터 Supabase 환경이 필요하며 실제 인증을 SQLite3만으로 확인할 수 없습니다. |

‘일단 SQLite3로 개발’이라는 방향에는 첫 번째 방식이 맞기 쉽지만 사용자 답변 전에는 확정하지 않습니다. 로그인 유지 방식도 이에 맞춰 결정합니다. 자체 인증을 선택하면 HttpOnly 쿠키를 이용한 방식이 검토 후보이며 쿠키·CORS·CSRF 설정을 함께 검토합니다.

### 6.2. 새 오류 생성 시 해결 상태 선택 — 미정

`spec.md` 6.1절에는 처음부터 해결 상태로 저장한다는 설명과 새 오류는 미해결로 저장한다는 설명이 함께 있습니다. 기본 미해결 및 해결 시 해결 방법 필수 규칙은 일치합니다. 생성 시 해결 상태 선택을 허용할지는 오류 기능 구현 전에 확인해야 합니다. 이번 점검에서는 원문의 동작을 임의로 바꾸지 않았습니다.

### 6.3. 그 밖의 확인 사항

- 초기 MVP 문서보다 PRD와 spec에서 댓글·좋아요·검색·신고 규칙이 구체화되었습니다. 이후 문서에서 확정된 규칙을 적용하고, 새 미정 항목은 따로 표시했습니다.
- 내 할 일 검색은 제외하고 공개 할 일 검색은 포함합니다.
- 내 오류 검색은 제목·오류 내용, 공개 오류 검색은 제목·오류 내용·해결 방법을 대상으로 합니다.
- 댓글·좋아요는 공개 공부 기록과 공개 오류 기록에만 적용합니다.
- 신고 운영자 조회를 위한 화면·API는 기존 신고 기능을 구현하는 범위이며, 별도의 신고 처리 상태는 만들지 않습니다.
- 운영 Supabase 연결 주소와 권한 설정은 실제 프로젝트 준비 시 확정합니다. 인증을 FastAPI에서 관리하면 현재 프로젝트 생성이나 연결값 제공은 필요하지 않습니다.
- 제외 기능은 이메일 확인, 비밀번호 찾기, 할 일 마감일·중요도, 내 할 일 검색, 댓글 답글입니다.

## 7. 이후 사용할 명령의 준비안

이 명령은 아직 프로젝트가 없으므로 실행하지 않았으며, Phase 1 이후 실제 구성에 맞게 검증하고 갱신합니다.

| 실행 위치 | 명령 후보 | 용도 |
| --- | --- | --- |
| 프로젝트 루트 | `python -m venv backend/.venv` | 가상환경 준비 |
| 프로젝트 루트 | `backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt` | 백엔드 의존성 설치 |
| backend | `.venv/Scripts/python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000` | API 서버 실행 |
| backend | `.venv/Scripts/python.exe -m pytest` | 백엔드 자동 테스트 |
| frontend | `npm.cmd ci` | 잠금 파일이 만들어진 이후 프론트 의존성 재현 설치 |
| frontend | `npm.cmd run dev -- --host 127.0.0.1 --port 5173` | React 개발 서버 실행 |
| frontend | `npm.cmd run build` | React 빌드 확인 |

DB 구조 변경 명령과 프론트 테스트 명령은 도구 설정 후 기록합니다. 기존 SQLite3 DB나 운영 Supabase DB를 삭제하는 명령은 포함하지 않습니다.

## 8. Phase 0 확인표

- [x] 기술 변경을 MVP·PRD·spec·plan에 반영했습니다.
- [x] 회원·기록·공개·소통·신고 및 제외 기능의 범위를 대조했습니다.
- [x] Python·pip·Node.js·npm·SQLite 실행 상태를 확인했습니다.
- [x] 패키지 설치 없이 공식 실행 조건과 버전 후보를 조회했습니다.
- [x] DB 도구 후보와 로컬 실행 설정안을 정리했습니다.
- [x] npm 실행 문제의 설정 변경 없는 대안을 확인했습니다.
- [x] 문서 충돌과 미정 사항을 숨기지 않고 기록했습니다.
- [x] 설치·코드 작성·DB 생성·Git 작업을 하지 않았습니다.
- [ ] 회원 인증 담당과 로그인 유지 방식 결정
- [ ] 오류 생성 시 상태 선택 규칙 확인
- [ ] 사용자의 결과 확인 후 Phase 1 진행

결론: 환경 점검은 완료했습니다. 미정 사항이 남아 있으므로 Phase 0 전체 완료와 Phase 1 착수는 아직 보류 상태입니다.
