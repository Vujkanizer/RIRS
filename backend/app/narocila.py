from datetime import datetime, timezone
from decimal import Decimal

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request

from app import db
from app.auth import samo
from app.models import Jed, Miza, Narocilo, Postavka, Rezervacija, Skladisce, Transakcija
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
        db.select(Postavka, Jed.naziv, Skladisce.naziv)
        .join(Jed, Postavka.jed_id == Jed.id)
        .join(Skladisce, Jed.skladisce_id == Skladisce.id)
        .where(Postavka.narocilo_id == narocilo_id)
        .order_by(Postavka.id)
    ).all()
    return jsonify(
        [
            {
                "id": postavka.id,
                "jed_id": postavka.jed_id,
                "naziv": naziv,
                "kolicina": postavka.kolicina,
                "cena": format(postavka.cena, "f"),
                "status": postavka.status,
                "hod": postavka.hod,
                "skladisce": skladisce,
            }
            for postavka, naziv, skladisce in vrstice
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

    skladisce = db.session.get(Skladisce, jed.skladisce_id)
    postavka = Postavka(
        narocilo_id=narocilo.id,
        jed_id=jed.id,
        kolicina=kolicina,
        cena=jed.cena,
        status="caka",
        hod=1 if skladisce is not None and skladisce.naziv == "kuhinja" else None,
    )
    db.session.add(postavka)
    db.session.commit()
    return jsonify(postavka_json(postavka)), 201


@bp.delete("/<int:narocilo_id>/postavke/<int:postavka_id>")
@samo("natakar")
def izbrisi_postavko(narocilo_id, postavka_id):
    narocilo = db.session.get(Narocilo, narocilo_id)
    if narocilo is None:
        return jsonify(napaka="Naročilo ne obstaja."), 404
    if narocilo.status != "odprto":
        return jsonify(napaka="Naročilo ni odprto."), 400

    postavka = db.session.get(Postavka, postavka_id)
    if postavka is None or postavka.narocilo_id != narocilo.id:
        return jsonify(napaka="Postavka ne obstaja."), 404

    if postavka.kolicina > 1:
        postavka.kolicina -= 1
    else:
        db.session.delete(postavka)
    db.session.commit()
    return jsonify(id=postavka_id)


@bp.patch("/<int:narocilo_id>/postavke/<int:postavka_id>")
def spremeni_status(narocilo_id, postavka_id):
    verify_jwt_in_request()
    kdo = get_jwt().get("vloga")
    if kdo not in ("kuhar", "natakar", "administrator"):
        return jsonify(napaka="Nimate dovoljenja."), 403

    narocilo = db.session.get(Narocilo, narocilo_id)
    if narocilo is None:
        return jsonify(napaka="Naročilo ne obstaja."), 404
    if narocilo.status != "odprto":
        return jsonify(napaka="Naročilo ni odprto."), 400

    postavka = db.session.get(Postavka, postavka_id)
    if postavka is None or postavka.narocilo_id != narocilo.id:
        return jsonify(napaka="Postavka ne obstaja."), 404

    podatki = request.get_json(silent=True) or {}
    novi = podatki.get("status")
    if novi not in ("pripravljena", "postrezena"):
        return jsonify(napaka="Status ni veljaven."), 400

    jed = db.session.get(Jed, postavka.jed_id)
    skladisce = db.session.get(Skladisce, jed.skladisce_id)
    pijaca = postavka.hod is None and skladisce is not None and skladisce.naziv != "kuhinja"

    if kdo == "kuhar" or (kdo == "administrator" and novi == "pripravljena"):
        if novi != "pripravljena":
            return jsonify(napaka="Nimate dovoljenja."), 403
        if pijaca or postavka.status != "caka":
            return jsonify(napaka="Jed ni v pripravi."), 400
    elif kdo not in ("natakar", "administrator") or novi != "postrezena":
        return jsonify(napaka="Nimate dovoljenja."), 403
    elif not (postavka.status == "pripravljena" or (pijaca and postavka.status == "caka")):
        return jsonify(napaka="Jed še ni pripravljena."), 400

    postavka.status = novi
    db.session.commit()
    return jsonify(postavka_json(postavka))


@bp.post("/mize/<int:miza_id>/zasedi")
@samo("natakar")
def zasedi(miza_id):
    miza = db.session.get(Miza, miza_id)
    if miza is None:
        return jsonify(napaka="Miza ne obstaja."), 404
    if miza.status != "prosta":
        return jsonify(napaka="Miza ni prosta."), 400
    miza.status = "zasedena"
    db.session.commit()
    return jsonify(id=miza.id, stevilka=miza.stevilka, status=miza.status)


@bp.post("/<int:narocilo_id>/zakljucek")
@samo("natakar")
def zakljuci(narocilo_id):
    narocilo = db.session.get(Narocilo, narocilo_id)
    if narocilo is None:
        return jsonify(napaka="Naročilo ne obstaja."), 404
    if narocilo.status != "odprto":
        return jsonify(napaka="Naročilo ni odprto."), 400

    miza = db.session.get(Miza, narocilo.miza_id)
    postavke = db.session.scalars(db.select(Postavka).filter_by(narocilo_id=narocilo.id)).all()

    poraba = {}
    znesek = Decimal("0.00")
    for postavka in postavke:
        znesek += postavka.kolicina * postavka.cena
        poraba[postavka.jed_id] = poraba.get(postavka.jed_id, 0) + postavka.kolicina

    jedi = []
    for jed_id, kolicina in poraba.items():
        jed = db.session.get(Jed, jed_id)
        if jed is None or jed.zaloga < kolicina:
            return jsonify(napaka="Zaloga ni dovolj."), 409
        jedi.append((jed, kolicina))

    for jed, kolicina in jedi:
        jed.zaloga -= kolicina

    zdaj = datetime.now(timezone.utc)
    narocilo.status = "zakljuceno"
    narocilo.zakljuceno_ob = zdaj
    narocilo.skupni_znesek = znesek
    miza.status = "prosta"
    db.session.add(
        Transakcija(vrsta="prodaja", narocilo_id=narocilo.id, znesek=znesek, cas=zdaj)
    )
    db.session.commit()
    return jsonify(
        id=narocilo.id,
        status=narocilo.status,
        skupni_znesek=format(znesek, "f"),
        miza_id=miza.id,
        miza_status=miza.status,
    )
