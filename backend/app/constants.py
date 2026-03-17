from typing import Literal

Provider = Literal["openai", "gemini", "anthropic"]

# File extensions to always skip (binary, media, fonts, etc.)
SKIP_EXTENSIONS: set[str] = {
    # Images
    ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".svg", ".webp", ".tiff",
    # Fonts
    ".woff", ".woff2", ".ttf", ".eot", ".otf",
    # Compiled / binary
    ".pyc", ".pyo", ".so", ".dll", ".dylib", ".exe", ".class", ".o", ".a",
    ".wasm",
    # Archives
    ".zip", ".tar", ".gz", ".bz2", ".7z", ".rar",
    # Media
    ".mp3", ".mp4", ".wav", ".avi", ".mov", ".pdf",
    # Data / DB
    ".sqlite", ".db",
}

# Exact filenames to skip (lock files, auto-generated manifests)
SKIP_FILENAMES: set[str] = {
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "Gemfile.lock",
    "Pipfile.lock",
    "poetry.lock",
    "composer.lock",
    "cargo.lock",
    "go.sum",
    "flake.lock",
    "pubspec.lock",
    "packages.lock.json",
    "bun.lockb",
}

# Suffixes for minified or auto-generated files
SKIP_SUFFIXES: tuple[str, ...] = (".min.js", ".min.css", ".min.map", ".map")

# Directory segments that indicate generated content
SKIP_DIRS: set[str] = {
    "node_modules",
    "vendor",
    "dist",
    "build",
    "__pycache__",
    ".next",
    "coverage",
    ".git",
}
