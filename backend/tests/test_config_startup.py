"""AC-057: the app fails fast, naming OPENAI_API_KEY, when it is unset.

This has to run in a subprocess: every other test in this suite imports
`app.main` with `OPENAI_API_KEY` already set (see `conftest.py`), and Python
caches that import for the rest of the process, so an in-process re-import
would not re-run whatever startup check the app performs.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

_BACKEND_DIR = Path(__file__).resolve().parent.parent


def _run_import_with_env(openai_api_key: str | None) -> subprocess.CompletedProcess:
    env = {k: v for k, v in __import__("os").environ.items() if k != "OPENAI_API_KEY"}
    if openai_api_key is not None:
        env["OPENAI_API_KEY"] = openai_api_key
    return subprocess.run(
        [sys.executable, "-c", "import app.main"],
        cwd=str(_BACKEND_DIR),
        env=env,
        capture_output=True,
        text=True,
        timeout=30,
    )


def test_app_fails_fast_when_openai_api_key_is_unset():
    result = _run_import_with_env(None)

    assert result.returncode != 0, (
        "importing the app with OPENAI_API_KEY unset must raise a fatal error, "
        f"but it exited 0. stdout={result.stdout!r} stderr={result.stderr!r}"
    )
    assert "OPENAI_API_KEY" in (result.stdout + result.stderr)


def test_app_fails_fast_when_openai_api_key_is_empty_string():
    result = _run_import_with_env("")

    assert result.returncode != 0, (
        "importing the app with OPENAI_API_KEY='' must raise a fatal error, "
        f"but it exited 0. stdout={result.stdout!r} stderr={result.stderr!r}"
    )
    assert "OPENAI_API_KEY" in (result.stdout + result.stderr)


def test_app_imports_cleanly_when_openai_api_key_is_set():
    result = _run_import_with_env("sk-a-plausible-looking-test-key")

    assert result.returncode == 0, f"stdout={result.stdout!r} stderr={result.stderr!r}"
