from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

from app import db
from app.auth import samo
from app.models import Jed, Uporabnik

bp = Blueprint("prijava", __name__, url_prefix="/api")


def besedilo(vrednost):
    if not isinstance(vrednost, str) or not vrednost.strip():
        return None
    return vrednost.strip()


def email_naslov(vrednost):
    naslov = besedilo(vrednost)
    if naslov is None or "@" not in naslov:
        return None
    return naslov.lower()


def odgovor(uporabnik):
    token = create_access_token(
        identity=str(uporabnik.id),
        additional_claims={"vloga": uporabnik.vloga},
    )
    return {
        "token": token,
        "vloga": uporabnik.vloga,
        "ime": uporabnik.ime,
        "priimek": uporabnik.priimek,
    }


@bp.post("/register")
def register():
    podatki = request.get_json(silent=True) or {}
    ime = besedilo(podatki.get("ime"))
    priimek = besedilo(podatki.get("priimek"))
    email = email_naslov(podatki.get("email"))
    geslo = podatki.get("geslo")
    if ime is None or priimek is None or email is None or not isinstance(geslo, str) or not geslo:
        return jsonify(napaka="Vnesite ime, priimek, email in geslo."), 400
    if db.session.scalar(db.select(Uporabnik).filter_by(email=email)) is not None:
        return jsonify(napaka="Email je že uporabljen."), 409

    uporabnik = Uporabnik(
        ime=ime,
        priimek=priimek,
        email=email,
        geslo_hash=generate_password_hash(geslo),
        vloga="gost",
    )
    db.session.add(uporabnik)
    db.session.commit()
    return jsonify(odgovor(uporabnik)), 201


@bp.post("/login")
def login():
    podatki = request.get_json(silent=True) or {}
    email = email_naslov(podatki.get("email"))
    geslo = podatki.get("geslo")
    uporabnik = None
    if email is not None:
        uporabnik = db.session.scalar(db.select(Uporabnik).filter_by(email=email))
    if uporabnik is None or not isinstance(geslo, str) or not check_password_hash(uporabnik.geslo_hash, geslo):
        return jsonify(napaka="Napačen email ali geslo."), 401
    return jsonify(odgovor(uporabnik))


@bp.get("/uporabniki")
@samo("administrator")
def seznam():
    osebe = db.session.scalars(
        db.select(Uporabnik)
        .filter(Uporabnik.vloga.in_(("natakar", "kuhar")))
        .order_by(Uporabnik.priimek, Uporabnik.ime)
    ).all()
    return jsonify(
        [
            {
                "id": oseba.id,
                "ime": oseba.ime,
                "priimek": oseba.priimek,
                "email": oseba.email,
                "vloga": oseba.vloga,
            }
            for oseba in osebe
        ]
    )


@bp.post("/uporabniki")
@samo("administrator")
def ustvari():
    podatki = request.get_json(silent=True) or {}
    ime = besedilo(podatki.get("ime"))
    priimek = besedilo(podatki.get("priimek"))
    email = email_naslov(podatki.get("email"))
    geslo = podatki.get("geslo")
    vloga = podatki.get("vloga")
    if vloga not in ("natakar", "kuhar"):
        return jsonify(napaka="Vloga je lahko samo natakar ali kuhar."), 400
    if ime is None or priimek is None or email is None or not isinstance(geslo, str) or not geslo:
        return jsonify(napaka="Vnesite ime, priimek, email in geslo."), 400
    if db.session.scalar(db.select(Uporabnik).filter_by(email=email)) is not None:
        return jsonify(napaka="Email je že uporabljen."), 409

    uporabnik = Uporabnik(
        ime=ime,
        priimek=priimek,
        email=email,
        geslo_hash=generate_password_hash(geslo),
        vloga=vloga,
    )
    db.session.add(uporabnik)
    db.session.commit()
    return jsonify(id=uporabnik.id, ime=uporabnik.ime, priimek=uporabnik.priimek, vloga=uporabnik.vloga), 201


def najdi_osebje(uporabnik_id):
    uporabnik = db.session.get(Uporabnik, uporabnik_id)
    if uporabnik is None or uporabnik.vloga not in ("natakar", "kuhar"):
        return None
    return uporabnik


@bp.patch("/uporabniki/<int:uporabnik_id>")
@samo("administrator")
def uredi(uporabnik_id):
    uporabnik = najdi_osebje(uporabnik_id)
    if uporabnik is None:
        return jsonify(napaka="Račun ne obstaja."), 404

    podatki = request.get_json(silent=True) or {}
    ime = besedilo(podatki.get("ime"))
    priimek = besedilo(podatki.get("priimek"))
    email = email_naslov(podatki.get("email"))
    vloga = podatki.get("vloga")
    if vloga not in ("natakar", "kuhar"):
        return jsonify(napaka="Vloga je lahko samo natakar ali kuhar."), 400
    if ime is None or priimek is None or email is None:
        return jsonify(napaka="Vnesite ime, priimek in email."), 400

    zaseden = db.session.scalar(db.select(Uporabnik).filter_by(email=email))
    if zaseden is not None and zaseden.id != uporabnik.id:
        return jsonify(napaka="Email je že uporabljen."), 409

    geslo = podatki.get("geslo")
    if geslo not in (None, ""):
        if not isinstance(geslo, str):
            return jsonify(napaka="Geslo ni veljavno."), 400
        uporabnik.geslo_hash = generate_password_hash(geslo)

    uporabnik.ime = ime
    uporabnik.priimek = priimek
    uporabnik.email = email
    uporabnik.vloga = vloga
    db.session.commit()
    return jsonify(id=uporabnik.id, ime=uporabnik.ime, priimek=uporabnik.priimek, email=uporabnik.email, vloga=uporabnik.vloga)


@bp.delete("/uporabniki/<int:uporabnik_id>")
@samo("administrator")
def izbrisi(uporabnik_id):
    uporabnik = najdi_osebje(uporabnik_id)
    if uporabnik is None:
        return jsonify(napaka="Račun ne obstaja."), 404
    try:
        db.session.delete(uporabnik)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify(napaka="Računa ni mogoče izbrisati, ker je že uporabljen."), 409
    return jsonify(id=uporabnik_id)


@bp.get("/jedilnik")
@samo("gost")
def jedilnik():
    jedi = db.session.scalars(db.select(Jed).order_by(Jed.kategorija, Jed.naziv)).all()
    return jsonify(
        [
            {
                "id": jed.id,
                "naziv": jed.naziv,
                "cena": format(jed.cena, "f"),
                "kategorija": jed.kategorija,
            }
            for jed in jedi
        ]
    )
