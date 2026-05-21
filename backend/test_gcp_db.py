import os
import sys

# Ensure backend root is in PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from src.core.config import settings
from src.db.session import engine, SessionLocal
from sqlalchemy import text


def test_connection():
    print("=" * 60)
    print("  GCP Cloud SQL Service Account Integration — Test Suite")
    print("=" * 60)
    print(f"  USE_CLOUD_SQL      : {settings.USE_CLOUD_SQL}")
    print(f"  INSTANCE_CONN_NAME  : {settings.INSTANCE_CONN_NAME}")
    print(f"  SA_KEY_FILE         : {settings.SA_KEY_FILE}")
    print(f"  SA_DB_USER          : {settings.SA_DB_USER}")
    print(f"  MYSQL_DB            : {settings.MYSQL_DB}")
    print("-" * 60)

    try:
        # Test direct engine connection
        print("Connecting to DB engine ...")
        with engine.connect() as conn:
            now = conn.execute(text("SELECT NOW() as now")).scalar()
            print(f"  [OK] Connection OK!")
            print(f"  [OK] Server Staging Time: {now}")
 
            # Query hospitals table to verify schema tables exist
            print("\nQuerying 'hospitals' table ...")
            hospitals = conn.execute(text("SELECT id, name, email FROM hospitals LIMIT 5")).fetchall()
            print(f"  [OK] Query OK! Seeded hospitals found: {len(hospitals)}")
            for idx, h in enumerate(hospitals, 1):
                print(f"     {idx}. [ID: {h[0]}] {h[1]} ({h[2]})")
 
            # Query roles table to verify role mappings
            print("\nQuerying 'roles' table ...")
            roles = conn.execute(text("SELECT id, name FROM roles")).fetchall()
            print(f"  [OK] Query OK! Seeded roles found: {len(roles)}")
            for r in roles:
                print(f"     - [ID: {r[0]}] {r[1]}")
 
            # Query users table to verify user credentials exist
            print("\nQuerying 'users' table ...")
            users = conn.execute(text("SELECT id, email, full_name, is_active FROM users LIMIT 5")).fetchall()
            print(f"  [OK] Query OK! Seeded users found: {len(users)}")
            for u in users:
                print(f"     - [ID: {u[0]}] {u[1]} | {u[2]} (Active: {u[3]})")
 
        print("\nALL CHECKS PASSED SUCCESSFULLY!")
    except Exception as e:
        print(f"\nCONNECTION AND QUERY FAILED:")
        print(f"Error detail: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    test_connection()
