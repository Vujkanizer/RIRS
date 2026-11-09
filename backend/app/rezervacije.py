from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity

from app import db
from app.auth import samo
from app.models import Miza, Rezervacija, Uporabnik

bp = Blueprint("rezervacije", __name__, url_prefix="/api/rezervacije")


def preberi_dan(vrednost):
    if not isinstance(vrednost, str) or not vrednost.strip():
        return None
    try:
        return datetime.strptime(vrednost.strip(), "%Y-%m-%d").date()
    except ValueError:
        return None


def preberi_cas(vrednost):
    if not isinstance(vrednost, str) or not vrednost.strip():
        return None
    try:
        cas = datetime.fromisoformat(vrednost)
    except ValueError:
        return None
    if cas.tzinfo is None:
        cas = cas.replace(tzinfo=timezone.utc)
    return cas


def preberi_stevilo(vrednost):
    if isinstance(vrednost, bool) or not isinstance(vrednost, int) or vrednost < 1:
        return None
    return vrednost


def prekriva(prva_zacetek, prve_minute, druga_zacetek, druge_minute):
    prvi_konec = prva_zacetek + timedelta(minutes=prve_minute)
    drugi_konec = druga_zacetek + timedelta(minutes=druge_minute)
    return prva_zacetek < drugi_konec and druga_zacetek < prvi_konec


def miza_prosta(miza_id, zacetek, trajanje):
    potrjene = db.session.scalars(
        db.select(Rezervacija).filter_by(miza_id=miza_id, status="potrjena")
    ).all()
    for rezervacija in potrjene:
        if prekriva(zacetek, trajanje, rezervacija.zacetek, rezervacija.trajanje_minut):
            return False
    return True


def kot_json(rezervacija):
    return {
        "id": rezervacija.id,
        "miza_id": rezervacija.miza_id,
        "zacetek": rezervacija.zacetek.isoformat(),
        "trajanje_minut": rezervacija.trajanje_minut,
        "stevilo_oseb": rezervacija.stevilo_oseb,
        "opomba": rezervacija.opomba or "",
        "status": rezervacija.status,
    }


@bp.get("/dan")
@samo("natakar")
def dan():
    izbran = preberi_dan(request.args.get("datum"))
    if izbran is None:
        return jsonify(napaka="Vnesite dan."), 400

    zacetek = datetime.combine(izbran, datetime.min.time(), tzinfo=timezone.utc)
    konec = zacetek + timedelta(days=1)
    vrstice = db.session.execute(
        db.select(Rezervacija.zacetek, Rezervacija.opomba, Miza.stevilka, Uporabnik.ime, Uporabnik.priimek)
        .join(Miza, Rezervacija.miza_id == Miza.id)
        .join(Uporabnik, Rezervacija.uporabnik_id == Uporabnik.id)
        .where(
            Rezervacija.status == "potrjena",
            Rezervacija.zacetek >= zacetek,
            Rezervacija.zacetek < konec,
        )
        .order_by(Rezervacija.zacetek)
    ).all()
    return jsonify(
        [
            {
                "ura": vrstica.zacetek.astimezone(timezone.utc).strftime("%H:%M"),
                "stevilka_mize": vrstica.stevilka,
                "ime": vrstica.ime,
                "priimek": vrstica.priimek,
                "opomba": vrstica.opomba or "",
            }
            for vrstica in vrstice
        ]
    )


@bp.get("/mize")
@samo("gost")
def proste_mize():
    zacetek = preberi_cas(request.args.get("zacetek"))
    if zacetek is None:
        return jsonify(napaka="Vnesite datum in uro."), 400

    if "trajanje_minut" in request.args:
        trajanje = request.args.get("trajanje_minut", type=int)
        if trajanje is None or trajanje < 1:
            return jsonify(napaka="Trajanje ni veljavno."), 400
    else:
        trajanje = 120

    mize = db.session.scalars(db.select(Miza).order_by(Miza.stevilka)).all()
    return jsonify(
        [
            {
                "id": m.id,
                "stevilka": m.stevilka,
                "stevilo_sedezev": m.stevilo_sedezev,
                "prosta": miza_prosta(m.id, zacetek, trajanje),
            }
            for m in mize
        ]
    )


@bp.get("")
@samo("gost")
def seznam():
    gost_id = int(get_jwt_identity())
    rezervacije = db.session.scalars(
        db.select(Rezervacija)
        .filter_by(uporabnik_id=gost_id)
        .order_by(Rezervacija.zacetek)
    ).all()
    return jsonify([kot_json(r) for r in rezervacije])


@bp.post("")
@samo("gost")
def vnos():
    podatki = request.get_json(silent=True) or {}
    zacetek = preberi_cas(podatki.get("zacetek"))
    stevilo_oseb = preberi_stevilo(podatki.get("stevilo_oseb"))
    miza_id = preberi_stevilo(podatki.get("miza_id"))
    if zacetek is None or stevilo_oseb is None or miza_id is None:
        return jsonify(napaka="Vnesite datum, uro, število oseb in mizo."), 400

    if "trajanje_minut" in podatki:
        trajanje = preberi_stevilo(podatki.get("trajanje_minut"))
        if trajanje is None:
            return jsonify(napaka="Trajanje ni veljavno."), 400
    else:
        trajanje = 120

    if db.session.get(Miza, miza_id) is None:
        return jsonify(napaka="Miza ne obstaja."), 404
    if not miza_prosta(miza_id, zacetek, trajanje):
        return jsonify(napaka="Miza ni prosta."), 409

    opomba = podatki.get("opomba")
    if isinstance(opomba, str) and opomba.strip():
        opomba = opomba.strip()
    else:
        opomba = None

    rezervacija = Rezervacija(
        uporabnik_id=int(get_jwt_identity()),
        miza_id=miza_id,
        zacetek=zacetek,
        trajanje_minut=trajanje,
        stevilo_oseb=stevilo_oseb,
        opomba=opomba,
        status="potrjena",
    )
    db.session.add(rezervacija)
    db.session.commit()
    return jsonify(kot_json(rezervacija)), 201
