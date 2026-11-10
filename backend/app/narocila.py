from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity

from app import db
from app.auth import samo
from app.models import Jed, Miza, Narocilo, Postavka, Rezervacija
from app.rezervacije import preberi_stevilo

bp = Blueprint("narocila", __name__, url_prefix="/api/narocila")


def narocilo_json(narocilo):
    return {
        "id": narocilo.id,
        "miza_id": narocilo.miza_id,
        "natakar_id": narocilo.natakar_id,
        "rezervacija_id": narocilo.rezervacija_id,
        "status": narocilo.status,
        "odprto_ob": narocilo.odprto_ob.isoformat(),
    }


def postavka_json(postavka):
    return {
        "id": postavka.id,
        "narocilo_id": postavka.narocilo_id,
        "jed_id": postavka.jed_id,
        "kolicina": postavka.kolicina,
        "cena": format(postavka.cena, "f"),
        "status": postavka.status,
    }


@bp.get("/mize")
@samo("natakar")
def mize():
    mize = db.session.scalars(db.select(Miza).order_by(Miza.stevilka)).all()
    odprta = {
        narocilo.miza_id: narocilo.id
        for narocilo in db.session.scalars(db.select(Narocilo).filter_by(status="odprto"))
    }
    return jsonify(
        [
            {
                "id": miza.id,
                "stevilka": miza.stevilka,
                "status": miza.status,
                "narocilo_id": odprta.get(miza.id),
            }
            for miza in mize
        ]
    )


@bp.get("/jedilnik")
@samo("natakar")
def jedilnik():
    jedi = db.session.scalars(db.select(Jed).order_by(Jed.kategorija, Jed.naziv)).all()
    return jsonify(
        [
            {
                "id": jed.id,
                "naziv": jed.naziv,
                "cena": format(jed.cena, "f"),
                "kategorija": jed.kategorija,
                "na_voljo": jed.zaloga > 0,
            }
            for jed in jedi
        ]
    )


@bp.get("/<int:narocilo_id>/postavke")
@samo("natakar")
def seznam_postavk(narocilo_id):
    if db.session.get(Narocilo, narocilo_id) is None:
        return jsonify(napaka="Naročilo ne obstaja."), 404
    vrstice = db.session.execute(
        db.select(Postavka, Jed.naziv)
        .join(Jed, Postavka.jed_id == Jed.id)
        .where(Postavka.narocilo_id == narocilo_id)
        .order_by(Postavka.id)
    ).all()
    return jsonify(
        [
            {
                "id": postavka.id,
                "naziv": naziv,
                "kolicina": postavka.kolicina,
                "cena": format(postavka.cena, "f"),
                "status": postavka.status,
            }
            for postavka, naziv in vrstice
        ]
    )


@bp.post("")
@samo("natakar")
def odpri():
    podatki = request.get_json(silent=True) or {}
    miza_id = preberi_stevilo(podatki.get("miza_id"))
    if miza_id is None:
        return jsonify(napaka="Vnesite mizo."), 400

    miza = db.session.get(Miza, miza_id)
    if miza is None:
        return jsonify(napaka="Miza ne obstaja."), 404
    if miza.status != "zasedena":
        return jsonify(napaka="Naročilo se odpre samo za zasedeno mizo."), 400

    odprto = db.session.scalar(
        db.select(Narocilo).filter_by(miza_id=miza_id, status="odprto")
    )
    if odprto is not None:
        return jsonify(napaka="Na mizi je že odprto naročilo."), 409

    rezervacija_id = None
    if "rezervacija_id" in podatki and podatki.get("rezervacija_id") is not None:
        rezervacija_id = preberi_stevilo(podatki.get("rezervacija_id"))
        if rezervacija_id is None:
            return jsonify(napaka="Rezervacija ne obstaja."), 400
        rezervacija = db.session.get(Rezervacija, rezervacija_id)
        if rezervacija is None or rezervacija.miza_id != miza_id:
            return jsonify(napaka="Rezervacija ne pripada tej mizi."), 400

    narocilo = Narocilo(
        miza_id=miza_id,
        natakar_id=int(get_jwt_identity()),
        rezervacija_id=rezervacija_id,
        status="odprto",
        odprto_ob=datetime.now(timezone.utc),
    )
    db.session.add(narocilo)
    db.session.commit()
    return jsonify(narocilo_json(narocilo)), 201


@bp.post("/<int:narocilo_id>/postavke")
@samo("natakar")
def dodaj(narocilo_id):
    narocilo = db.session.get(Narocilo, narocilo_id)
    if narocilo is None:
        return jsonify(napaka="Naročilo ne obstaja."), 404
    if narocilo.status != "odprto":
        return jsonify(napaka="Naročilo ni odprto."), 400

    podatki = request.get_json(silent=True) or {}
    jed_id = preberi_stevilo(podatki.get("jed_id"))
    kolicina = preberi_stevilo(podatki.get("kolicina"))
    if jed_id is None or kolicina is None:
        return jsonify(napaka="Vnesite jed in količino."), 400

    jed = db.session.get(Jed, jed_id)
    if jed is None:
        return jsonify(napaka="Jed ne obstaja."), 404
    if jed.zaloga < 1 or kolicina > jed.zaloga:
        return jsonify(napaka="Jed ni na voljo."), 409

    postavka = Postavka(
        narocilo_id=narocilo.id,
        jed_id=jed.id,
        kolicina=kolicina,
        cena=jed.cena,
        status="caka",
    )
    db.session.add(postavka)
    db.session.commit()
    return jsonify(postavka_json(postavka)), 201
