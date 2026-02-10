from typing import TypedDict

from anthropic import Anthropic
from google import genai
from openai import OpenAI

from app.logging import get_logger

logger = get_logger(__name__)


class TokenUsage(TypedDict):
    prompt: int | None
    completion: int | None
    total: int | None


class ReviewResult(TypedDict):
    review: str
    provider: str
    model: str
    tokens: TokenUsage


REVIEW_PROMPT = """You are a code reviewer. Analyze this pull request diff and provide a concise review.

Focus on:
1. Critical bugs and logic errors
2. Security vulnerabilities (SQL injection, XSS, auth issues)
3. Performance problems (N+1 queries, inefficient algorithms)
4. Code smells that will cause maintainability issues

Be direct and concise. Only mention serious issues. Don't comment on style or formatting.

Format your response as a markdown list with clear severity indicators:
- 🔴 CRITICAL: Must fix before merge
- 🟡 WARNING: Should fix soon
- 🔵 SUGGESTION: Consider improving

Here's the diff:

{diff}

Provide your review:"""


def get_review(diff: str, provider: str, model: str, api_key: str) -> ReviewResult:
    """Call LLM to get code review based on the provided diff.

    Returns:
        ReviewResult containing:
        - review: The review text
        - provider: The LLM provider used
        - model: The model used
        - tokens: Dict with prompt, completion, and total token counts
    """
    prompt = REVIEW_PROMPT.format(diff=diff)
    logger.debug(f"Requesting review from {provider} using model {model}")

    result: ReviewResult | None = None

    if provider == "openai":
        result = get_openai_review(prompt, model, api_key)
    elif provider == "gemini":
        result = get_gemini_review(prompt, model, api_key)
    elif provider == "claude":
        result = get_claude_review(prompt, model, api_key)
    else:
        raise ValueError(f"Unknown provider: {provider}")

    if not result or not result.get("review"):
        raise RuntimeError(f"{provider} returned empty response")

    result["review"] = result["review"].strip()
    return result


def get_openai_review(prompt: str, model: str, api_key: str) -> ReviewResult | None:
    """Get review from openai"""
    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are an expert code reviewer."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=1000,
        )
        usage = response.usage
        return {
            "review": response.choices[0].message.content,
            "provider": "openai",
            "model": model,
            "tokens": {
                "prompt": usage.prompt_tokens,
                "completion": usage.completion_tokens,
                "total": usage.total_tokens,
            },
        }
    except Exception as e:
        raise RuntimeError(f"OpenAI request failed {e}") from e


def get_gemini_review(prompt: str, model: str, api_key: str) -> ReviewResult | None:
    """Get review from gemini"""
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=model,
            contents=prompt,
        )
        usage = response.usage_metadata if hasattr(response, "usage_metadata") else None
        tokens = {
            "prompt": usage.prompt_token_count if usage else None,
            "completion": usage.completion_token_count if usage else None,
            "total": usage.total_token_count if usage else None,
        }
        return {
            "review": response.text,
            "provider": "gemini",
            "model": model,
            "tokens": tokens,
        }
    except Exception as e:
        raise RuntimeError(f"Gemini request failed {e}") from e


def get_claude_review(prompt: str, model: str, api_key: str) -> ReviewResult | None:
    """Get review from claude"""
    try:
        client = Anthropic(api_key=api_key)

        response = client.messages.create(
            model=model, messages=[{"role": "user", "content": prompt}], max_tokens=1024
        )

        usage = response.usage

        return {
            "review": response.content[0].text,
            "provider": "claude",
            "model": model,
            "tokens": {
                "prompt": usage.input_tokens,
                "completion": usage.output_tokens,
                "total": usage.input_tokens + usage.output_tokens,
            },
        }

    except Exception as e:
        raise RuntimeError(f"Claude request failed {e}") from e
