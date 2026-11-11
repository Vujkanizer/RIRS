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


def v_delovnem_casu(zacetek):
    minute = zacetek.hour * 60 + zacetek.minute
    return 8 * 60 <= minute < 24 * 60


def miza_prosta(miza_id, zacetek):
    dan = zacetek.astimezone(timezone.utc).date()
    zacetek_dneva = datetime.combine(dan, datetime.min.time(), tzinfo=timezone.utc)
    konec_dneva = zacetek_dneva + timedelta(days=1)
    odprta = db.session.scalar(
        db.select(Rezervacija.id)
        .filter(
            Rezervacija.miza_id == miza_id,
            Rezervacija.status == "potrjena",
            Rezervacija.zacetek >= zacetek_dneva,
            Rezervacija.zacetek < konec_dneva,
        )
        .limit(1)
    )
    return odprta is None


def kot_json(rezervacija):
    miza = db.session.get(Miza, rezervacija.miza_id)
    return {
        "id": rezervacija.id,
        "miza_id": rezervacija.miza_id,
        "stevilka_mize": miza.stevilka if miza else None,
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
        db.select(Rezervacija.id, Rezervacija.zacetek, Rezervacija.opomba, Miza.stevilka, Uporabnik.ime, Uporabnik.priimek)
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
                "id": vrstica.id,
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

    if not v_delovnem_casu(zacetek):
        return jsonify(napaka="Restavracija je odprta od 8. do 23. ure."), 400

    mize = db.session.scalars(db.select(Miza).order_by(Miza.stevilka)).all()
    return jsonify(
        [
            {
                "id": m.id,
                "stevilka": m.stevilka,
                "stevilo_sedezev": m.stevilo_sedezev,
                "prosta": miza_prosta(m.id, zacetek),
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

    if not v_delovnem_casu(zacetek):
        return jsonify(napaka="Restavracija je odprta od 8. do 23. ure."), 400
    if db.session.get(Miza, miza_id) is None:
        return jsonify(napaka="Miza ne obstaja."), 404
    if not miza_prosta(miza_id, zacetek):
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
        trajanje_minut=120,
        stevilo_oseb=stevilo_oseb,
        opomba=opomba,
        status="potrjena",
    )
    db.session.add(rezervacija)
    db.session.commit()
    return jsonify(kot_json(rezervacija)), 201


@bp.post("/<int:rezervacija_id>/odpoved")
@samo("gost")
def odpoved(rezervacija_id):
    rezervacija = db.session.get(Rezervacija, rezervacija_id)
    if rezervacija is None or rezervacija.uporabnik_id != int(get_jwt_identity()):
        return jsonify(napaka="Rezervacija ne obstaja."), 404
    if rezervacija.status != "potrjena":
        return jsonify(napaka="Rezervacijo lahko odpoveste samo, dokler je potrjena."), 400
    rezervacija.status = "odpovedana"
    db.session.commit()
    return jsonify(kot_json(rezervacija))


@bp.post("/<int:rezervacija_id>/zakljucek")
@samo("natakar")
def zakljucek(rezervacija_id):
    rezervacija = db.session.get(Rezervacija, rezervacija_id)
    if rezervacija is None:
        return jsonify(napaka="Rezervacija ne obstaja."), 404
    if rezervacija.status != "potrjena":
        return jsonify(napaka="Rezervacija ni odprta."), 400
    rezervacija.status = "zakljucena"
    db.session.commit()
    return jsonify(kot_json(rezervacija))
