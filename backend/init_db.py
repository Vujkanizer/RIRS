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
    from werkzeug.security import generate_password_hash

    from app import create_app, db
    from app.models import Jed, Miza, Skladisce, Uporabnik

    app = create_app()
    with app.app_context():
        db.create_all()
        db.session.execute(text("ALTER TABLE rezervacija DROP CONSTRAINT IF EXISTS ck_rezervacija_status"))
        db.session.execute(
            text(
                "ALTER TABLE rezervacija ADD CONSTRAINT ck_rezervacija_status "
                "CHECK (status IN ('potrjena', 'odpovedana', 'gost_prisel', 'zakljucena'))"
            )
        )
        db.session.commit()
        for naziv in ("kuhinja", "bar"):
            if db.session.query(Skladisce).filter_by(naziv=naziv).first() is None:
                db.session.add(Skladisce(naziv=naziv))
        db.session.commit()

        if db.session.query(Uporabnik).filter_by(email="admin@gmail.com").first() is None:
            db.session.add(
                Uporabnik(
                    ime="Admin",
                    priimek="Glass",
                    email="admin@gmail.com",
                    geslo_hash=generate_password_hash("admin"),
                    vloga="administrator",
                )
            )

        for stevilka, sedezi in ((1, 2), (2, 2), (3, 4), (4, 4), (5, 6)):
            if db.session.query(Miza).filter_by(stevilka=stevilka).first() is None:
                db.session.add(Miza(stevilka=stevilka, stevilo_sedezev=sedezi, status="prosta"))

        kuhinja = db.session.query(Skladisce).filter_by(naziv="kuhinja").one()
        bar = db.session.query(Skladisce).filter_by(naziv="bar").one()
        jedi = (
            ("Gobova juha", "predjed", "8.50", 20, kuhinja.id),
            ("Solata", "predjed", "7.00", 15, kuhinja.id),
            ("Goveja juha", "predjed", "6.50", 18, kuhinja.id),
            ("Zrezek", "glavna_jed", "16.00", 12, kuhinja.id),
            ("Rižota", "glavna_jed", "14.00", 14, kuhinja.id),
            ("Ribja plošča", "glavna_jed", "18.50", 10, kuhinja.id),
            ("Potica", "sladica", "5.50", 16, kuhinja.id),
            ("Sladoled", "sladica", "4.50", 20, kuhinja.id),
            ("Čaša vina", "pijaca", "3.50", 30, bar.id),
            ("Mineralna voda", "pijaca", "2.50", 40, bar.id),
        )
        for naziv, kategorija, cena, zaloga, skladisce_id in jedi:
            if db.session.query(Jed).filter_by(naziv=naziv).first() is None:
                db.session.add(
                    Jed(
                        skladisce_id=skladisce_id,
                        naziv=naziv,
                        cena=cena,
                        kategorija=kategorija,
                        zaloga=zaloga,
                    )
                )
        db.session.commit()


if __name__ == "__main__":
    main()
