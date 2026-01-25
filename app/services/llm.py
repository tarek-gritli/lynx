from openai import OpenAI
from google import genai
from anthropic import Anthropic

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


def get_review(diff: str, provider: str, model: str, api_key: str) -> str:
    """Call LLM to get code review based on the provided diff"""
    prompt = REVIEW_PROMPT.format(diff=diff)
    
    review: str | None = None
    
    if provider == "openai":
        review = get_openai_review(prompt, model, api_key)
    elif provider == "gemini":
        review = get_gemini_review(prompt, model, api_key)
    elif provider == "claude":
        review = get_claude_review(prompt, model, api_key)
    else:
        raise ValueError(f"Unknown provider: {provider}")
    
    if not review:
        raise RuntimeError(f"{provider} returned empty response")
    
    
    return review.strip()

def get_openai_review(prompt: str, model: str, api_key: str) -> str | None:
    """Get review from openai""" 
    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are an expert code reviewer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
    except Exception as e:
        raise RuntimeError(f"OpenAI request failed {e}") from e
    
    return response.choices[0].message.content
    
def get_gemini_review(prompt: str, model: str, api_key: str) -> str | None:
    """Get review from gemini"""
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            
        )
    except Exception as e:
        raise RuntimeError(f"Gemini request failed {e}") from e
    
    return response.text

def get_claude_review(prompt: str, model: str, api_key: str) -> str | None:
    """Get review from claude"""
    try:
        client = Anthropic(api_key=api_key)
        
        response = client.messages.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=1024
        )
    except Exception as e:
        raise RuntimeError(f"Claude request failed {e}") from e
    
    if not response.content:
        return None
    return response.content[0].text
