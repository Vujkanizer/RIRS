from flask import Blueprint, jsonify

from app import db
from app.auth import samo
from app.models import Jed, Miza, Narocilo, Postavka, Transakcija, Uporabnik

bp = Blueprint("racuni", __name__, url_prefix="/api/racuni")


@bp.get("")
@samo("administrator")
def seznam():
    vrstice = db.session.execute(
        db.select(Transakcija, Narocilo, Miza, Uporabnik)
        .join(Narocilo, Transakcija.narocilo_id == Narocilo.id)
        .join(Miza, Narocilo.miza_id == Miza.id)
        .join(Uporabnik, Narocilo.natakar_id == Uporabnik.id)
        .where(Transakcija.vrsta == "prodaja")
        .order_by(Transakcija.cas.desc())
    ).all()

    racuni = []
    for transakcija, narocilo, miza, natakar in vrstice:
        postavke = db.session.execute(
            db.select(Postavka, Jed.naziv)
            .join(Jed, Postavka.jed_id == Jed.id)
            .where(Postavka.narocilo_id == narocilo.id)
            .order_by(Postavka.id)
        ).all()
        skupine = {}
        for postavka, naziv in postavke:
            kljuc = (postavka.jed_id, format(postavka.cena, "f"))
            if kljuc in skupine:
                skupine[kljuc]["kolicina"] += postavka.kolicina
            else:
                skupine[kljuc] = {
                    "naziv": naziv,
                    "kolicina": postavka.kolicina,
                    "cena": format(postavka.cena, "f"),
                }
        racuni.append(
            {
                "id": transakcija.id,
                "narocilo_id": narocilo.id,
                "cas": transakcija.cas.isoformat(),
                "znesek": format(transakcija.znesek, "f"),
                "stevilka_mize": miza.stevilka,
                "natakar": f"{natakar.ime} {natakar.priimek}",
                "postavke": list(skupine.values()),
            }
        )
    return jsonify(racuni)
