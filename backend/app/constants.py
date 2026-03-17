from typing import Literal

Provider = Literal["openai", "gemini", "anthropic"]

OPENAI_MODELS: set[str] = {
    "gpt-5.2",
    "gpt-5-mini",
    "gpt-5-nano",
    "gpt-5",
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-4",
    "o1",
    "o1-mini",
    "o3",
    "o3-mini",
}

GEMINI_MODELS: set[str] = {
    "gemini-3-pro-preview",
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
}

ANTHROPIC_MODELS: set[str] = {
    "claude-opus-4-6",
    "claude-sonnet-4-5-20250929",
    "claude-haiku-4-5-20251001",
    "claude-opus-4-5-20251101",
    "claude-opus-4-1-20250805",
    "claude-sonnet-4-20250514",
    "claude-3-7-sonnet-20250219",
    "claude-opus-4-20250514",
    "claude-3-haiku-20240307",
}

PROVIDER_MODELS: dict[str, set[str]] = {
    "openai": OPENAI_MODELS,
    "gemini": GEMINI_MODELS,
    "anthropic": ANTHROPIC_MODELS,
}

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
