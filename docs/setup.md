# BuildLog 개발 환경과 실행 안내

점검일: 2026-10-26 (한국 시간)

## 1. 현재 상태

Phase 1의 실행 뼈대에 이어 Phase 2의 SQLite3 회원 데이터 기반과 Phase 3의 회원가입·로그인·닉네임 변경을 완료했습니다. 회원 인증은 FastAPI가 담당합니다. 오류 생성 상태 규칙은 아직 미정이며 Phase 4는 시작하지 않았습니다.

아래 2~8절은 Phase 0 당시의 점검 기록입니다. 최신 실행 안내와 Phase 1 결과는 9절, Phase 2·3 결과는 10절을 따릅니다. Supabase 연결은 관련 수업 이후로 미뤘으며 Git 커밋·push는 수행하지 않았습니다.

## 2. 확정한 기술 구성

| 구분 | 사용 기술 |
| --- | --- |
| 프론트엔드 | React |
| 백엔드 | Python, FastAPI |
| 초기 개발·테스트 DB | SQLite3 |
| 현재 DB | SQLite3 |

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
| 현재 DB | SQLite3 |
| 백엔드 `APP_ENV` | 실행 환경 구분 |
| 백엔드 `DATABASE_URL` | 선택 사항이며 기본값은 로컬 SQLite3 경로 |
| 백엔드 `CORS_ORIGINS` | 허용할 React 주소, 로컬에서는 위 프론트 주소 |
| 프론트 `VITE_API_BASE_URL` | 공개 가능한 FastAPI 주소 |

로컬 SQLite 연결 URL은 실행 위치에 따라 다른 파일을 만들지 않도록 프로젝트 기준 절대 경로로 변환합니다. 비밀번호·DB 연결 문자열·서버 비밀키는 프론트 환경 변수에 넣지 않습니다. 인증용 비밀키와 Supabase Auth 관련 항목은 인증 방식 결정 후 추가합니다. `.env.example`은 실제 비밀값 없이 항목을 공유합니다.

`.gitignore`에는 현재 `.env`, `.env.*`, `.venv/`, `node_modules/`, `dist/`, `__pycache__/`, 로그 제외 및 `.env.example` 예외가 있습니다. SQLite3 파일, DB 부속 파일과 테스트 생성물 제외 규칙은 아직 없으며, 계획대로 Phase 1에서 필요한 부분만 보완합니다. Phase 0에서는 `.gitignore`를 수정하지 않았습니다.

## 6. 문서 검토 결과와 남은 결정

### 6.1. 회원 인증 담당 — 결정 완료

회원가입과 로그인은 FastAPI에서 관리합니다. 비밀번호는 Argon2 해시로 SQLite3에 저장하며 원문은 저장하지 않습니다. 로그인 상태는 무작위 세션 토큰의 해시를 DB에 저장하고 HttpOnly·SameSite 쿠키로 전달합니다. Supabase는 관련 수업 이후 별도로 검토합니다.

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
- [x] 회원 인증 담당과 로그인 유지 방식 결정
- [ ] 오류 생성 시 상태 선택 규칙 확인
- [ ] 사용자의 결과 확인 후 Phase 1 진행

Phase 0 당시 결론: 환경 점검은 완료했으나 미정 사항이 남았습니다. 이후 사용자의 Phase 1 진행 요청으로 인증과 독립적인 실행 뼈대만 먼저 구현했습니다. 최신 결과는 다음 절을 참고합니다.

## 9. Phase 1 결과와 실제 실행 방법

### 9.1. 구현 범위

- `backend/.venv`에 패키지를 설치하고 전체 설치 버전을 `backend/requirements.txt`에 고정했습니다.
- `backend/app/main.py`에 FastAPI 앱과 `GET /api/health`를 만들었습니다.
- 상태 응답은 `{"status":"ok","service":"BuildLog API"}`뿐이며 DB·환경 변수·비밀 설정을 노출하지 않습니다. DB 연결 상태를 검사하는 API는 아닙니다.
- `frontend/`에 React·Vite 프로젝트를 만들고 정확한 버전과 `package-lock.json`을 기록했습니다.
- 홈에는 공부 기록·할 일·오류 기록의 안내 카드와 서버 연결 상태를 표시합니다. 기록 기능은 준비 중이며 동작하지 않는 작성·저장 버튼은 만들지 않았습니다.
- API 요청 실패 시 안내와 다시 확인 버튼을 제공하며, 예상과 다른 응답도 정상 연결로 표시하지 않습니다.
- CORS는 `http://127.0.0.1:5173`과 `http://localhost:5173`을 허용하며 현재는 GET만, 자격 증명 전달 없이 구성했습니다. 인증 결정 후 필요한 설정을 추가합니다.
- 설정은 `backend/.env`, `frontend/.env`로 나눕니다. 실제 파일 없이도 로컬 기본값으로 실행됩니다. 공유용 `.env.example`만 만들었으며 실제 비밀값은 없습니다.
- SQLite3 및 부속 파일, 가상환경, npm 설치 폴더, 빌드·테스트 결과물의 Git 제외 규칙을 확인하고 보완했습니다.

### 9.2. 사용 버전

| 구성 | 설치한 버전 |
| --- | --- |
| Python / Node.js | 기존 3.13.14 / 24.22.1 |
| FastAPI / Uvicorn | 0.162.0 / 0.54.0 |
| Pydantic Settings / pytest | 2.16.1 / 9.1.1 |
| React / React DOM | 19.3.1 / 19.3.1 |
| Vite / React 플러그인 | 8.3.5 / 6.1.2 |
| Playwright | 1.64.1, 기존 설치된 Microsoft Edge 사용 |

DB 모델·마이그레이션 도구 및 인증 라이브러리는 아직 설치하지 않았습니다. Phase 2 이후 필요한 단계에서 결정·추가합니다.

### 9.3. 지금 실행하기 (Windows PowerShell)

터미널 두 개를 프로젝트 루트 `buildlog`에서 열어 각각 실행합니다. 가상환경을 활성화할 필요는 없습니다.

첫 번째 터미널 — API 서버:

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

두 번째 터미널 — React:

```powershell
cd frontend
npm.cmd run dev
```

브라우저에서 `http://127.0.0.1:5173`을 열고 서버 연결 성공 문구를 확인합니다. API는 `http://127.0.0.1:8000/api/health`, API 문서는 `http://127.0.0.1:8000/docs`에서 확인합니다. 각 터미널에서 `Ctrl+C`로 종료합니다. 다른 프로그램이 같은 포트를 사용하면 실행을 중단하고 주소 설정을 함께 조정합니다.

### 9.4. 다른 환경에서 의존성 다시 설치하기

프로젝트 루트에서 실행합니다. 이미 준비된 현재 환경에서는 다시 실행할 필요가 없습니다.

```powershell
python -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
cd frontend
npm.cmd ci
```

설정을 바꾸고 싶으면 `backend/.env.example`을 `backend/.env`로, `frontend/.env.example`을 `frontend/.env`로 복사해 수정합니다. `.env`는 Git에서 제외됩니다. `CORS_ORIGINS`는 JSON 배열이며 프론트 API 주소와 서버 주소를 함께 맞춰야 합니다. `DATABASE_URL`은 현재 연결하지 않으며 기본값은 작업 위치와 무관하게 프로젝트의 `database/buildlog.sqlite3`를 가리킵니다.

### 9.5. 검증 명령과 결과

프로젝트 루트에서 백엔드 테스트:

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest -q
```

프로젝트 루트에서 프론트 빌드와 실제 브라우저 테스트:

```powershell
cd frontend
npm.cmd run build
npm.cmd run test:e2e
```

브라우저 테스트는 비어 있는 8000·5173 포트에서 API·프론트 서버를 자동 시작하고 종료합니다. 이미 수동 서버가 실행 중이면 종료 후 테스트합니다. 설치된 Microsoft Edge를 사용하며 별도 브라우저 다운로드는 하지 않았습니다. 다른 컴퓨터에서 Edge가 없으면 브라우저 실행 환경을 먼저 준비해야 합니다.

확인 결과:

- 백엔드 테스트 5개: 상태 응답, 허용 CORS, 허용되지 않은 출처 차단, 환경 변수 적용·비노출, 작업 위치와 독립적인 DB 경로 확인
- Edge 브라우저 테스트 5개: 실제 FastAPI 연결, 네트워크 실패와 재시도 복구, 잘못된 서버 응답 처리, 360px 가로 넘침 검사, 데스크톱 홈 확인
- React 프로덕션 빌드 성공, Python 의존성 검사 통과
- 데스크톱과 360px 스크린샷을 열어 카드·버튼·문구 배치를 직접 확인
- 브라우저 테스트 서버 종료 확인, 업무용 DB 파일 미생성 확인

위 내용은 Phase 1 완료 당시의 기록입니다. 현재 회원 기능 상태와 다음 작업은 아래 Phase 2·3 결과를 따릅니다.

## 10. Phase 2·3 결과와 회원 기능 실행 안내

### 10.1. 구현 결과

- FastAPI가 회원가입과 로그인을 관리하며 SQLite3의 `users`, `user_sessions` 테이블에 저장합니다.
- 이메일과 닉네임은 중복 저장되지 않습니다. 이메일은 소문자로 정리하고 닉네임은 앞뒤 공백을 제거합니다.
- 비밀번호는 8~64자로 검사하고 Argon2 해시만 저장합니다. API 응답과 쿠키에는 비밀번호가 포함되지 않습니다.
- 닉네임은 2~20자이며 한글·영문·숫자·밑줄만 허용합니다.
- 로그인하면 무작위 세션 토큰의 해시를 DB에 저장하고, 브라우저에는 7일 동안 사용하는 HttpOnly·SameSite 쿠키를 설정합니다.
- React에 회원가입, 로그인, 보호된 내 기록 홈, 계정 설정 화면을 연결했습니다.
- 비로그인 사용자가 내 기록 홈이나 계정 설정에 접근하면 로그인 화면으로 이동합니다. FastAPI API도 인증되지 않은 요청을 거부합니다.
- 가입·로그인 실패 시 이메일과 닉네임은 유지하고 비밀번호 입력값은 지웁니다. 닉네임 변경 실패 시 입력값을 유지합니다.
- 이메일 확인, 비밀번호 찾기, 로그아웃과 기록 기능은 이번 단계에 추가하지 않았습니다.
- Supabase 관련 패키지·설정·키는 추가하지 않았습니다.

### 10.2. DB 준비와 실행

새 환경에서는 의존성을 설치한 뒤 프로젝트 루트에서 다음 명령으로 SQLite3 테이블을 준비합니다.

```powershell
cd backend
.\.venv\Scripts\python.exe -m alembic upgrade head
```

그다음 9.3절의 API 서버와 React 서버 실행 명령을 사용합니다. 현재 컴퓨터에는 `database/buildlog.sqlite3`가 만들어졌고 첫 DB 변경 이력이 적용되었습니다. 실제 사용자 계정은 만들지 않았습니다. 이 DB 파일은 Git에서 제외됩니다.

DB 구조를 변경할 때는 기존 파일을 직접 지우지 않고 Alembic 변경 이력을 추가합니다. 테스트는 별도의 임시 SQLite3 DB를 사용하므로 로컬 확인용 데이터에 영향을 주지 않습니다.

### 10.3. 검증 결과

- 백엔드 테스트 13개 통과: 첫 DB 변경 이력, 회원 저장·재실행 후 유지, 중복 차단, 입력 경계값, 비밀번호 해시, 로그인 쿠키, 인증 차단, 닉네임 변경 권한을 확인했습니다.
- Edge 브라우저 테스트 8개 통과: 회원가입, 로그인, 내 기록 홈, 닉네임 변경, 비로그인 이동 차단, 실패 시 입력 유지, 360px 화면을 확인했습니다.
- React 프로덕션 빌드와 Python 의존성 검사가 통과했습니다.
- 모바일 회원가입 화면과 데스크톱 계정 설정 화면의 스크린샷을 직접 확인했습니다.
- 비밀번호·API 키·Supabase 연결값은 코드와 공유 문서에 넣지 않았습니다.

확인하지 않은 항목:

- Chrome·Safari와 실제 휴대폰에서의 화면 확인
- 장기간 실행 후 7일 세션 만료 동작
- 아직 만들지 않은 공부 기록·할 일·오류 기록과의 권한 연결
- Supabase 연동

다음 단계는 Phase 4의 세 가지 기록 데이터 구조입니다. 오류 기록을 생성할 때 처음부터 해결 상태를 선택할 수 있는지는 Phase 4 전에 결정해야 합니다. 기존 `docs/README.md`는 변경하지 않았고 commit·push도 하지 않았습니다.
