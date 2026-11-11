from flask import Blueprint, jsonify

from app import db
from app.auth import samo
from app.models import Jed, Miza, Narocilo, Postavka, Skladisce

bp = Blueprint("kuhinja", __name__, url_prefix="/api/kuhinja")


@bp.get("")
@samo("kuhar")
def pregled():
    kuhinja = db.session.scalar(db.select(Skladisce).filter_by(naziv="kuhinja"))
    if kuhinja is None:
        return jsonify([])

    vrstice = db.session.execute(
        db.select(Postavka, Jed.naziv, Miza.stevilka, Narocilo.id)
        .join(Jed, Postavka.jed_id == Jed.id)
        .join(Narocilo, Postavka.narocilo_id == Narocilo.id)
        .join(Miza, Narocilo.miza_id == Miza.id)
        .where(
            Narocilo.status == "odprto",
            Jed.skladisce_id == kuhinja.id,
            Postavka.status != "postrezena",
            Postavka.hod.is_not(None),
        )
        .order_by(Miza.stevilka, Postavka.hod, Postavka.id)
    ).all()

    po_narocilu = {}
    for postavka, naziv, stevilka, narocilo_id in vrstice:
        skupina = po_narocilu.get(narocilo_id)
        if skupina is None:
            skupina = {
                "stevilka_mize": stevilka,
                "narocilo_id": narocilo_id,
                "hod": postavka.hod,
                "jedi": [],
            }
            po_narocilu[narocilo_id] = skupina
        if postavka.hod != skupina["hod"]:
            continue
        skupina["jedi"].append(
            {
                "id": postavka.id,
                "naziv": naziv,
                "kolicina": postavka.kolicina,
                "status": postavka.status,
            }
        )

    return jsonify(list(po_narocilu.values()))
