from fastapi import APIRouter, HTTPException, Request
import hmac
import hashlib
from app.config import settings
import json

router = APIRouter()

def verify_signature(payload, signature_header) -> bool:
    """Verify GitHub webhook signature"""
    if not signature_header:
        raise HTTPException(status_code=403, detail="Missing signature header")
    
    hash_object = hmac.new(settings.github_webhook_secret.encode('utf-8'), msg=payload, digestmod=hashlib.sha256)
    
    expected_signature = "sha256=" + hash_object.hexdigest()
    
    if not hmac.compare_digest(expected_signature, signature_header):
        raise HTTPException(status_code=403, detail="Invalid signature")
    
    return True

@router.post("/github")
async def github_webhook(req: Request):
    signature = req.headers.get("X-Hub-Signature-256")
    
    payload = await req.body()
    
    
    verify_signature(payload, signature)
    
    event = req.headers.get("X-Github-Event")
    data = await req.json()
    
    print(f"Received event: {event}")
    print(f"Action: {data.get('action')}")

    print(f"Data JSON: {json.dumps(data, indent=2)}")
    
    if event == "pull_request" and data.get("action") == "opened":
        # TODO: Trigger review
        pr_number = data["pull_request"]["number"]
        repo_name = data["repository"]["full_name"]
        print(f"PR #{pr_number} opened in {repo_name}")
        return {"status": "review_queued"}
    
    elif event == "issue_comment" and data.get("action") == "created":
        comment_body = data["comment"]["body"].strip()
        if comment_body.startswith("/review"):
            # TODO: Trigger review
            pr_number = data["issue"]["number"]
            repo_name = data["repository"]["full_name"]
            print(f"/review triggered on PR #{pr_number} in {repo_name}")
            return {"status": "review_queued"}
    
    return {"status": "ignored"}