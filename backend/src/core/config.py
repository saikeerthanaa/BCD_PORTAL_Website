import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Tanuh BCD API"
    PROJECT_VERSION: str = "1.0.0"

    MYSQL_USER: str = os.getenv("MYSQL_USER")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD")
    MYSQL_HOST: str = os.getenv("MYSQL_HOST")
    MYSQL_PORT: str = os.getenv("MYSQL_PORT", 3306)
    MYSQL_DB: str = os.getenv("MYSQL_DB", "bcd_application2")
    # DB URL used by SQLAlchemy. Keep as-is for normal connections.
    DATABASE_URL: str = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"

    # Google Cloud SQL Service Account IAM settings
    USE_CLOUD_SQL: bool = os.getenv("USE_CLOUD_SQL", "true").lower() == "true"
    INSTANCE_CONN_NAME: str = os.getenv("INSTANCE_CONN_NAME", "bcd-prototypes:asia-south1:tanuh-bcd-questionnaire-dev")
    SA_KEY_FILE: str = os.getenv("SA_KEY_FILE", os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "service-account.json"))
    SA_DB_USER: str = os.getenv("SA_DB_USER", "tanuh-bcd-portal")

    # Optional SSL client certificate files (absolute paths). If provided,
    # the code will pass them to the DB driver so the app connects with mTLS.
    MYSQL_SSL_CA: str = os.getenv("MYSQL_SSL_CA")
    MYSQL_SSL_CERT: str = os.getenv("MYSQL_SSL_CERT")
    MYSQL_SSL_KEY: str = os.getenv("MYSQL_SSL_KEY")

    SECRET_KEY: str = os.getenv("SECRET_KEY", "9a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b") # Should be in .env
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    GCP_STORAGE_BUCKET: str = os.getenv("GCP_STORAGE_BUCKET")
    GOOGLE_APPLICATION_CREDENTIALS: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

settings = Settings()
