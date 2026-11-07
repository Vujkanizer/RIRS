import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv(Path(__file__).resolve().parent / ".env")


def ensure_database():
    url = os.environ["DATABASE_URL"]
    admin_url = url.rsplit("/", 1)[0] + "/postgres"
    engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")
    with engine.connect() as conn:
        exists = conn.execute(text("SELECT 1 FROM pg_database WHERE datname = 'glass'")).scalar()
        if not exists:
            conn.execute(text("CREATE DATABASE glass"))
    engine.dispose()


def main():
    ensure_database()
    from app import create_app, db
    from app.models import Skladisce

    app = create_app()
    with app.app_context():
        db.create_all()
        for naziv in ("kuhinja", "bar"):
            if db.session.query(Skladisce).filter_by(naziv=naziv).first() is None:
                db.session.add(Skladisce(naziv=naziv))
        db.session.commit()


if __name__ == "__main__":
    main()
