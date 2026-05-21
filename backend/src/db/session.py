from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from ..core.config import settings
import os

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

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
