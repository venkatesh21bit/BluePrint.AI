from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    google_api_key: str = ""
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/blueprint_ai"
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    cors_origins: List[str] = ["http://localhost:3000"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
