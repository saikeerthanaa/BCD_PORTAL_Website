from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from ..core.config import settings
import os

Base = declarative_base()

if settings.USE_CLOUD_SQL:
    from google.cloud.sql.connector import Connector
    from google.oauth2 import service_account
    import pymysql

    _connector = None

    def get_connector():
        global _connector
        if _connector is None:
            if not os.path.exists(settings.SA_KEY_FILE):
                raise FileNotFoundError(
                    f"Google Cloud SQL Service Account key file not found at: {settings.SA_KEY_FILE}"
                )
            creds = service_account.Credentials.from_service_account_file(
                settings.SA_KEY_FILE,
                scopes=["https://www.googleapis.com/auth/cloud-platform"],
            )
            _connector = Connector(credentials=creds)
        return _connector

    def getconn():
        connector = get_connector()
        conn = connector.connect(
            settings.INSTANCE_CONN_NAME,
            "pymysql",
            user=settings.SA_DB_USER,
            db=settings.MYSQL_DB,
            enable_iam_auth=True,
        )
        return conn

    # Use creator=getconn for Google Cloud SQL connections
    engine = create_engine(
        "mysql+pymysql://",
        creator=getconn,
    )
else:
    # Build optional connect_args for SSL client-cert authentication when
    # certificate paths are provided via environment variables.
    connect_args = {}
    ssl_args = {}
    if settings.MYSQL_SSL_CA or settings.MYSQL_SSL_CERT or settings.MYSQL_SSL_KEY:
        # Use absolute paths; ensure files are readable by the process user.
        if settings.MYSQL_SSL_CA:
            ssl_args['ca'] = settings.MYSQL_SSL_CA
        if settings.MYSQL_SSL_CERT:
            ssl_args['cert'] = settings.MYSQL_SSL_CERT
        if settings.MYSQL_SSL_KEY:
            ssl_args['key'] = settings.MYSQL_SSL_KEY
        # Pass the 'ssl' dict through to the DBAPI (PyMySQL accepts ssl={...}).
        connect_args['ssl'] = ssl_args

    engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
