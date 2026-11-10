from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, verify_jwt_in_request

from app import db
from app.models import Jed, Skladisce

bp = Blueprint("zaloge", __name__, url_prefix="/api/zaloge")


def vloga():
    verify_jwt_in_request()
    return get_jwt().get("vloga")


def artikel_json(jed, skladisce):
    return {
        "id": jed.id,
        "naziv": jed.naziv,
        "zaloga": jed.zaloga,
        "skladisce": skladisce,
    }


@bp.get("/<naziv>")
def seznam(naziv):
    kdo = vloga()
    if naziv not in ("kuhinja", "bar"):
        return jsonify(napaka="Skladišče ne obstaja."), 404
    if kdo == "kuhar" and naziv != "kuhinja":
        return jsonify(napaka="Nimate dovoljenja."), 403
    if kdo not in ("kuhar", "natakar", "administrator"):
        return jsonify(napaka="Nimate dovoljenja."), 403

    skladisce = db.session.scalar(db.select(Skladisce).filter_by(naziv=naziv))
    if skladisce is None:
        return jsonify(napaka="Skladišče ne obstaja."), 404

    jedi = db.session.scalars(
        db.select(Jed).filter_by(skladisce_id=skladisce.id).order_by(Jed.naziv)
    ).all()
    return jsonify([artikel_json(jed, naziv) for jed in jedi])


@bp.patch("/<int:jed_id>")
def nastavi(jed_id):
    if vloga() != "administrator":
        return jsonify(napaka="Nimate dovoljenja."), 403

    jed = db.session.get(Jed, jed_id)
    if jed is None:
        return jsonify(napaka="Jed ne obstaja."), 404

    podatki = request.get_json(silent=True) or {}
    zaloga = podatki.get("zaloga")
    if isinstance(zaloga, bool) or not isinstance(zaloga, int) or zaloga < 0:
        return jsonify(napaka="Vnesite zalogo."), 400

    jed.zaloga = zaloga
    db.session.commit()
    skladisce = db.session.get(Skladisce, jed.skladisce_id)
    return jsonify(artikel_json(jed, skladisce.naziv))
