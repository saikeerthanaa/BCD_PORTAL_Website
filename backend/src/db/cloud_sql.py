"""Google Cloud SQL connector helper for MySQL (PyMySQL).

This module provides a simple `getconn()` for direct connections and
`get_sqlalchemy_engine()` for SQLAlchemy integration. It reads configuration
from environment variables but provides sensible defaults matching the
snippet you supplied.
"""
import os
from google.cloud.sql.connector import Connector
import pymysql
from sqlalchemy import create_engine

# Optional: point to service account JSON (if not already set)
if not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"C:\Users\tange\Desktop\check database\bcd-prototypes-7fc3307eb348.json"

# Instance and DB credentials (can be overridden via env vars)
INSTANCE_CONNECTION_NAME = os.getenv(
    "CLOUD_SQL_INSTANCE",
    "bcd-prototypes:asia-south1:tanuh-bcd-questionnaire-dev",
)
DB_USER = os.getenv("CLOUD_SQL_DB_USER", "tanuh_website_builder")
DB_PASS = os.getenv("CLOUD_SQL_DB_PASS", "Tanuh12345!")
DB_NAME = os.getenv("CLOUD_SQL_DB_NAME", "bcd_application2")

_connector = Connector()


def getconn():
    """Return a new PEP-249 compatible connection using the Connector."""
    conn = _connector.connect(
        INSTANCE_CONNECTION_NAME,
        "pymysql",
        user=DB_USER,
        password=DB_PASS,
        db=DB_NAME,
    )
    return conn


def get_sqlalchemy_engine(**engine_kwargs):
    """Create a SQLAlchemy Engine that uses the Cloud SQL connector as creator.

    Usage:
        engine = get_sqlalchemy_engine(pool_size=5, max_overflow=10)
    """
    return create_engine(
        "mysql+pymysql://",
        creator=getconn,
        **engine_kwargs,
    )


def test_connection():
    """Quick test: open a connection, run SELECT NOW(), print result."""
    try:
        conn = getconn()
        with conn.cursor() as cur:
            cur.execute("SELECT NOW();")
            print("Connected — DB time:", cur.fetchone()[0])
    finally:
        try:
            conn.close()
        except Exception:
            pass


def close_connector():
    try:
        _connector.close()
    except Exception:
        pass


if __name__ == "__main__":
    test_connection()
