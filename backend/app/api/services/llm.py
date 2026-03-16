from typing import TypedDict

from anthropic import AsyncAnthropic
from google import genai
from openai import AsyncOpenAI

from app.logging import get_logger
from app.prompts import REVIEW_PROMPT

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


async def get_review(
    diff: str, provider: str, model: str, api_key: str, template: str | None = None
) -> ReviewResult:
    """Call LLM to get code review based on the provided diff.

    Returns:
        ReviewResult containing:
        - review: The review text
        - provider: The LLM provider used
        - model: The model used
        - tokens: Dict with prompt, completion, and total token counts
    """
    prompt_template = template if template else REVIEW_PROMPT
    prompt = prompt_template.format(diff=diff)
    logger.debug(f"Requesting review from {provider} using model {model}")

    result: ReviewResult | None = None

    if provider == "openai":
        result = await get_openai_review(prompt, model, api_key)
    elif provider == "gemini":
        result = await get_gemini_review(prompt, model, api_key)
    elif provider == "anthropic":
        result = await get_anthropic_review(prompt, model, api_key)
    else:
        raise ValueError(f"Unknown provider: {provider}")

    if not result or not result.get("review"):
        raise RuntimeError(f"{provider} returned empty response")

    result["review"] = result["review"].strip()
    return result


async def get_openai_review(prompt: str, model: str, api_key: str) -> ReviewResult | None:
    """Get review from openai"""
    try:
        client = AsyncOpenAI(api_key=api_key)
        response = await client.chat.completions.create(
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


async def get_gemini_review(prompt: str, model: str, api_key: str) -> ReviewResult | None:
    """Get review from gemini"""
    try:
        client = genai.Client(api_key=api_key)
        response = await client.aio.models.generate_content(
            model=model,
            contents=prompt,
        )
        usage = response.usage_metadata if hasattr(response, "usage_metadata") else None
        tokens = {
            "prompt": usage.prompt_token_count if usage else None,
            "completion": usage.candidates_token_count if usage else None,
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


async def get_anthropic_review(prompt: str, model: str, api_key: str) -> ReviewResult | None:
    """Get review from Anthropic (Claude)"""
    try:
        client = AsyncAnthropic(api_key=api_key)

        response = await client.messages.create(
            model=model, messages=[{"role": "user", "content": prompt}], max_tokens=1024
        )

        usage = response.usage

        return {
            "review": response.content[0].text,
            "provider": "anthropic",
            "model": model,
            "tokens": {
                "prompt": usage.input_tokens,
                "completion": usage.output_tokens,
                "total": usage.input_tokens + usage.output_tokens,
            },
        }

    except Exception as e:
        raise RuntimeError(f"Anthropic request failed {e}") from e
