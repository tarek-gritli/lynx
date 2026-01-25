from openai import OpenAI, AuthenticationError as OpenAIAuthError
from google import genai
from anthropic import Anthropic, AuthenticationError as AnthropicAuthError


def validate_openai_key(api_key: str) -> tuple[bool, str]:
    """Validate OpenAI API key by listing models"""
    try:
        client = OpenAI(api_key=api_key)
        client.models.list()
        return True, "Valid"
    except OpenAIAuthError:
        return False, "Invalid API key"
    except Exception as e:
        return False, f"Validation failed: {str(e)}"


def validate_gemini_key(api_key: str) -> tuple[bool, str]:
    """Validate Gemini API key by listing models"""
    try:
        client = genai.Client(api_key=api_key)
        list(client.models.list())
        return True, "Valid"
    except Exception as e:
        error_msg = str(e).lower()
        if "api key" in error_msg or "invalid" in error_msg or "unauthorized" in error_msg:
            return False, "Invalid API key"
        return False, f"Validation failed: {str(e)}"


def validate_claude_key(api_key: str) -> tuple[bool, str]:
    """Validate Claude API key by making a minimal request"""
    try:
        client = Anthropic(api_key=api_key)
        client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1,
            messages=[{"role": "user", "content": "hi"}]
        )
        return True, "Valid"
    except AnthropicAuthError:
        return False, "Invalid API key"
    except Exception as e:
        error_msg = str(e).lower()
        if "api key" in error_msg or "invalid" in error_msg or "unauthorized" in error_msg:
            return False, "Invalid API key"
        return False, f"Validation failed: {str(e)}"


def validate_api_key(provider: str, api_key: str) -> tuple[bool, str]:
    """Validate API key for the given provider"""
    if provider == "openai":
        return validate_openai_key(api_key)
    elif provider == "gemini":
        return validate_gemini_key(api_key)
    elif provider == "claude":
        return validate_claude_key(api_key)
    else:
        return False, "Unsupported provider"
