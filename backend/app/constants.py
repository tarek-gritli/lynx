from typing import Literal

Provider = Literal["openai", "gemini", "claude"]

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

CLAUDE_MODELS: set[str] = {
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
    "claude": CLAUDE_MODELS,
}
