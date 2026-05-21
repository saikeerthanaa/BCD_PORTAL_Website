from sqlalchemy import text
from src.core.config import settings
from src.db.session import engine


def main():
    print(f"Using DB URL: {settings.DATABASE_URL}")
    try:
        with engine.connect() as conn:
            now = conn.execute(text("SELECT NOW() as now")).scalar()
            print("Connected — server time:", now)

            print("\nTables and approximate row counts:")
            rows = conn.execute(
                text("SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema=:schema ORDER BY table_rows DESC"),
                {"schema": settings.MYSQL_DB},
            )
            for row in rows:
                print(row[0], row[1])

    except Exception as e:
        print("Connection failed:", repr(e))


if __name__ == "__main__":
    main()
