"""Google Cloud SQL connector helper for MySQL (PyMySQL) using Service Account IAM Auth."""
import os
from google.cloud.sql.connector import Connector
from google.oauth2 import service_account
import pymysql
from sqlalchemy import create_engine
from ..core.config import settings

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
    """Return a new PEP-249 compatible connection using the Connector."""
    connector = get_connector()
    conn = connector.connect(
        settings.INSTANCE_CONN_NAME,
        "pymysql",
        user=settings.SA_DB_USER,
        db=settings.MYSQL_DB,
        enable_iam_auth=True,
    )
    return conn


def get_sqlalchemy_engine(**engine_kwargs):
    """Create a SQLAlchemy Engine that uses the Cloud SQL connector as creator."""
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
        if _connector:
            _connector.close()
    except Exception:
        pass


if __name__ == "__main__":
    test_connection()

