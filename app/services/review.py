from sqlalchemy.orm import Session
from app.utils.crypto import decrypt_key
from app.services.llm import get_review
from app.services.github import get_installation_client
from app.models import APIKey
from app.config import settings
from github import PullRequest


def perform_review(
    installation_id: int,
    repo_name: str,
    pr_number: int,
    user_id: int,
    db: Session
):
    gh = get_installation_client(installation_id)
    repo = gh.get_repo(repo_name)
    pr = repo.get_pull(pr_number)
    
    
    diff = get_pr_diff(pr)
    
    if not diff.strip():
        pr.create_issue_comment("⚠️ No changes detected in this PR.")
        return
    
    api_keys = db.query(APIKey).filter(
        APIKey.user_id == user_id
    ).all()
    
    if not api_keys:
        pr.create_issue_comment(
            "⚠️ **Lynx Review Not Configured**\n\n"
            "Please set up at least one API key (OpenAI, Gemini, or Claude) to enable reviews.\n\n"
            f"👉 Go to: {settings.frontend_url}/settings"
        )
        return

    reviews = []
    
    for api_key in api_keys:
        decrypted_api_key = decrypt_key(api_key.encrypted_key)
        try:
            review_text = get_review(
                diff=diff,
                provider=api_key.provider,
                api_key=decrypted_api_key
            )
            reviews.append({
                "provider": api_key.provider,
                "review": review_text
            })
        except Exception as e:
            reviews.append({
                "provider": api_key.provider,
                "review": f"❌ Lynx review failed: {str(e)}"
            })
        
    comment = format_multi_review(reviews)
    
    pr.create_issue_comment(comment)
    
    return comment

def get_pr_diff(pr: PullRequest) -> str:
    """Extract diff from PR"""
    
    files = pr.get_files()
    
    diff_parts = []
    for file in files:
        if file.patch:
            diff_parts.append(f"### File: {file.filename}\n")
            diff_parts.append(f"```diff\n{file.patch}\n```\n")
    return "\n".join(diff_parts)

def format_multi_review(reviews: list[dict]) -> str:
    
    header = "# 🔍 Lynx Review\n\n"
    
    sections = []
    
    for review in reviews:
        provider_emoji = {
            "openai": "🤖",
            "gemini": "✨",
            "claude": "🧠"
        }
        emoji = provider_emoji.get(review["provider"], "🔍")
        provider_name = review["provider"].title()
        
        sections.append(f"## {emoji} {provider_name} Review\n\n{review['review']}")
    
    body = "\n\n---\n\n".join(sections)
    
    return f"{header}{body}\n\n---\n*Powered by Lynx AI Code Review*"