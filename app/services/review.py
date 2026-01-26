from typing import Literal
from sqlalchemy.orm import Session
from app.utils.crypto import decrypt_key
from app.services.llm import get_review
from app.services.github import get_installation_client
from app.services.gitlab import (
    get_gitlab_client,
    get_project,
    get_merge_request,
    create_mr_note,
    get_mr_changes,
    get_valid_gitlab_token,
)
from app.models import APIKey, User
from app.config import settings
from github import PullRequest


def perform_review(
    repo_name: str,
    pr_number: int,
    user_id: int,
    db: Session,
    platform: Literal["github", "gitlab"] = "github",
    installation_id: int = None,
):
    """Perform code review for a PR/MR on either GitHub or GitLab"""
    if platform == "github":
        if installation_id is None:
            raise ValueError("installation_id is required for GitHub reviews")
        return _perform_github_review(installation_id, repo_name, pr_number, user_id, db)
    elif platform == "gitlab":
        return _perform_gitlab_review(repo_name, pr_number, user_id, db)
    else:
        raise ValueError(f"Unsupported platform: {platform}")


def _perform_github_review(
    installation_id: int,
    repo_name: str,
    pr_number: int,
    user_id: int,
    db: Session
):
    """Perform review for a GitHub Pull Request"""
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

    reviews = _generate_reviews(api_keys, diff)
    comment = _format_multi_review(reviews)
    
    pr.create_issue_comment(comment)
    
    return comment


def _perform_gitlab_review(
    repo_name: str,
    mr_iid: int,
    user_id: int,
    db: Session
):
    """Perform review for a GitLab Merge Request"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.gitlab_access_token:
        raise ValueError("User not found or GitLab not connected")
    
    gitlab_token = get_valid_gitlab_token(user, db)
    gl = get_gitlab_client(gitlab_token)
    project = get_project(gl, repo_name)
    mr = get_merge_request(project, mr_iid)
    
    diff = get_mr_diff(mr)
    
    if not diff.strip():
        create_mr_note(mr, "⚠️ No changes detected in this MR.")
        return
    
    api_keys = db.query(APIKey).filter(
        APIKey.user_id == user_id
    ).all()
    
    if not api_keys:
        create_mr_note(
            mr,
            "⚠️ **Lynx Review Not Configured**\n\n"
            "Please set up at least one API key (OpenAI, Gemini, or Claude) to enable reviews.\n\n"
            f"👉 Go to: {settings.frontend_url}/settings"
        )
        return

    reviews = _generate_reviews(api_keys, diff)
    comment = _format_multi_review(reviews)
    
    create_mr_note(mr, comment)
    
    return comment


def _generate_reviews(api_keys: list, diff: str) -> list[dict]:
    """Generate reviews from all configured API keys"""
    reviews = []
    
    for api_key in api_keys:
        decrypted_api_key = decrypt_key(api_key.encrypted_key)
        try:
            review_text = get_review(
                diff=diff,
                provider=api_key.provider,
                model=api_key.model,
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
    
    return reviews


def get_pr_diff(pr: PullRequest) -> str:
    """Extract diff from GitHub PR"""
    
    files = pr.get_files()
    
    diff_parts = []
    for file in files:
        if file.patch:
            diff_parts.append(f"### File: {file.filename}\n")
            diff_parts.append(f"```diff\n{file.patch}\n```\n")
    return "\n".join(diff_parts)


def get_mr_diff(mr) -> str:
    """Extract diff from GitLab MR"""
    
    changes = get_mr_changes(mr)
    
    diff_parts = []
    for change in changes:
        diff = change.get("diff", "")
        if diff:
            diff_parts.append(f"### File: {change.get('new_path', change.get('old_path', 'unknown'))}\n")
            diff_parts.append(f"```diff\n{diff}\n```\n")
    return "\n".join(diff_parts)


def _format_multi_review(reviews: list[dict]) -> str:
    
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