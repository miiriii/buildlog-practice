import tempfile
from pathlib import Path
import sys

import uvicorn

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from app.core.config import Settings
from app.db.base import Base
from app.main import create_app


with tempfile.TemporaryDirectory(prefix="buildlog-e2e-") as temp_dir:
    database_path = Path(temp_dir) / "e2e.sqlite3"
    settings = Settings(
        _env_file=None,
        app_env="test",
        database_url=f"sqlite:///{database_path.as_posix()}",
    )
    application = create_app(settings)
    Base.metadata.create_all(application.state.engine)
    uvicorn.run(application, host="127.0.0.1", port=8000)
