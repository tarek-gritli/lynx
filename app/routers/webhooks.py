from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.orm import Session
import hmac
import hashlib
import re
from app.config import settings
from app.services.github import get_installation_client
from app.models import User, APIKey
from app.database import get_db
from app.services.review import perform_review

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
async def github_webhook(req: Request, db: Session = Depends(get_db)):
    signature = req.headers.get("X-Hub-Signature-256")
    
    payload = await req.body()
    
    
    verify_signature(payload, signature)
    
    event = req.headers.get("X-Github-Event")
    data = await req.json()
    
    installation_id = data["installation"]["id"]
    sender_username = data["sender"]["login"]
    
    print(f"Event: {event}, Action: {data.get('action')}, User: {sender_username}")
    
    if event == "pull_request" and data.get("action") == "opened":
        pr_number=data["pull_request"]["number"]
        repo_name=data["repository"]["full_name"]
        
        user = db.query(User).filter(User.github_username == sender_username).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        perform_review(installation_id=installation_id, repo_name=repo_name, pr_number=pr_number, user_id=user.id, db=db)

        return {"status": "review_posted"}
    
    elif event == "issue_comment" and data.get("action") == "created":
        comment_body = data["comment"]["body"].strip()
        if re.match(r"^/review\b", comment_body, re.IGNORECASE):
            pr_number = data["issue"]["number"]
            repo_name = data["repository"]["full_name"]
            
            user = db.query(User).filter(User.github_username == sender_username).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            perform_review(installation_id=installation_id, repo_name=repo_name, pr_number=pr_number, user_id=user.id, db=db)

            return {"status": "review_posted"}
            
    return {"status": "event_ignored"}