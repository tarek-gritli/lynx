from app.utils.crypto import decrypt_key
from app.services.llm import get_review
from app.services.github import get_installation_client
from app.models import APIKey
from github import PullRequest


def perform_review(
    installation_id: int,
    repo_name: str,
    pr_number: int,
    llm_provider: str,
    api_key: APIKey,
):
    gh = get_installation_client(installation_id)
    repo = gh.get_repo(repo_name)
    pr = repo.get_pull(pr_number)
    
    
    diff = get_pr_diff(pr)
    
    decrypted_api_key = decrypt_key(api_key.encrypted_key)
    
    try:
        review_text = get_review(
            diff=diff,
            provider=llm_provider,
            api_key=decrypted_api_key
        )
    except Exception as e:
        pr.create_issue_comment(f"❌ Lynx review failed: {str(e)}")
        raise

    comment = f"## 🔍 Lynx Review\n\n{review_text}\n\n---\n*Powered by Lynx AI Code Review*"

    pr.create_issue_comment(comment)
    
    return review_text

def get_pr_diff(pr: PullRequest) -> str:
    """Extract diff from PR"""
    
    files = pr.get_files()
    
    diff_parts = []
    for file in files:
        if file.patch:
            diff_parts.append(f"### File: {file.filename}\n")
            diff_parts.append(f"```diff\n{file.patch}\n```\n")
    return "\n".join(diff_parts)