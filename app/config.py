from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    github_app_id: int
    github_private_key_path: str
    github_webhook_secret: str
    database_url: str
    encryption_key: str
    environment: str = "development"
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
