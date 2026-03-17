import os

from app.constants import SKIP_DIRS, SKIP_EXTENSIONS, SKIP_FILENAMES, SKIP_SUFFIXES


def should_skip_file(filepath: str) -> bool:
    """Return True if the file should be excluded from review."""
    basename = os.path.basename(filepath)
    _, ext = os.path.splitext(basename.lower())

    if ext in SKIP_EXTENSIONS:
        return True

    if basename in SKIP_FILENAMES:
        return True

    lower = basename.lower()
    if any(lower.endswith(s) for s in SKIP_SUFFIXES):
        return True

    parts = filepath.replace("\\", "/").split("/")
    if any(part in SKIP_DIRS for part in parts):
        return True

    return False
