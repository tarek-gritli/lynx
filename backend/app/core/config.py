from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    github_app_id: int
    github_private_key_path: str
    github_webhook_secret: str
    github_client_id: str
    github_client_secret: str
    gitlab_client_id: str
    gitlab_client_secret: str
    gitlab_url: str = "https://gitlab.com"
    gitlab_webhook_secret: str
    database_url: str
    postgres_user: str
    postgres_password: str
    postgres_db: str
    encryption_key: str
    jwt_secret: str
    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:5173"
    environment: str = "development"
    port: int = 8000
    api_prefix: str = "/api/v1"
    cors_origins: list[str] = ["http://localhost:5173"]
    cookie_secure: bool = True
    cookie_samesite: str = "lax"

    model_config = SettingsConfigDict(
        env_file="../.env",
        env_ignore_empty=True,
        extra="ignore",
    )


settings = Settings()
