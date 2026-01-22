from github import Github, GithubIntegration
from app.config import settings

def get_installation_client(installation_id: int) -> Github:
    
    with open(settings.github_private_key_path, "r") as f:
        private_key = f.read()
    
    integration = GithubIntegration(settings.github_app_id, private_key)
    auth = integration.get_access_token(installation_id)
    
    return Github(auth.token)