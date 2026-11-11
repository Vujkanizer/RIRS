from sqlalchemy import CheckConstraint, Index

from app import db

fk = db.ForeignKey


class Uporabnik(db.Model):
    __tablename__ = "uporabnik"
    __table_args__ = (
        CheckConstraint(
            "vloga IN ('gost', 'natakar', 'kuhar', 'administrator')",
            name="ck_uporabnik_vloga",
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    ime = db.Column(db.String(80), nullable=False)
    priimek = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    geslo_hash = db.Column(db.String(255), nullable=False)
    vloga = db.Column(db.String(20), nullable=False)


class Miza(db.Model):
    __tablename__ = "miza"
    __table_args__ = (
        CheckConstraint(
            "status IN ('prosta', 'rezervirana', 'zasedena')",
            name="ck_miza_status",
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    stevilka = db.Column(db.Integer, nullable=False, unique=True)
    stevilo_sedezev = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), nullable=False)


class Rezervacija(db.Model):
    __tablename__ = "rezervacija"
    __table_args__ = (
        CheckConstraint(
            "status IN ('potrjena', 'odpovedana', 'gost_prisel', 'zakljucena')",
            name="ck_rezervacija_status",
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    uporabnik_id = db.Column(db.Integer, fk("uporabnik.id", ondelete="RESTRICT"), nullable=False)
    miza_id = db.Column(db.Integer, fk("miza.id", ondelete="RESTRICT"), nullable=False)
    zacetek = db.Column(db.DateTime(timezone=True), nullable=False)
    trajanje_minut = db.Column(db.Integer, nullable=False, default=120, server_default="120")
    stevilo_oseb = db.Column(db.Integer, nullable=False)
    opomba = db.Column(db.Text)
    status = db.Column(db.String(20), nullable=False)


class Skladisce(db.Model):
    __tablename__ = "skladisce"
    __table_args__ = (
        CheckConstraint(
            "naziv IN ('kuhinja', 'bar')",
            name="ck_skladisce_naziv",
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    naziv = db.Column(db.String(20), nullable=False, unique=True)


class Jed(db.Model):
    __tablename__ = "jed"
    __table_args__ = (
        CheckConstraint(
            "kategorija IN ('predjed', 'glavna_jed', 'sladica', 'pijaca')",
            name="ck_jed_kategorija",
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    skladisce_id = db.Column(db.Integer, fk("skladisce.id", ondelete="RESTRICT"), nullable=False)
    naziv = db.Column(db.String(200), nullable=False)
    opis = db.Column(db.Text)
    cena = db.Column(db.Numeric(10, 2), nullable=False)
    kategorija = db.Column(db.String(20), nullable=False)
    zaloga = db.Column(db.Integer, nullable=False)


class Narocilo(db.Model):
    __tablename__ = "narocilo"
    __table_args__ = (
        CheckConstraint(
            "status IN ('odprto', 'zakljuceno')",
            name="ck_narocilo_status",
        ),
        Index(
            "uq_narocilo_odprto_miza",
            "miza_id",
            unique=True,
            postgresql_where=db.text("status = 'odprto'"),
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    miza_id = db.Column(db.Integer, fk("miza.id", ondelete="RESTRICT"), nullable=False)
    natakar_id = db.Column(db.Integer, fk("uporabnik.id", ondelete="RESTRICT"), nullable=False)
    rezervacija_id = db.Column(db.Integer, fk("rezervacija.id", ondelete="RESTRICT"), unique=True)
    status = db.Column(db.String(20), nullable=False)
    odprto_ob = db.Column(db.DateTime(timezone=True), nullable=False)
    zakljuceno_ob = db.Column(db.DateTime(timezone=True))
    skupni_znesek = db.Column(db.Numeric(10, 2))


class Postavka(db.Model):
    __tablename__ = "postavka"
    __table_args__ = (
        CheckConstraint(
            "status IN ('caka', 'pripravljena', 'postrezena')",
            name="ck_postavka_status",
        ),
        CheckConstraint(
            "hod IS NULL OR hod IN (1, 2, 3)",
            name="ck_postavka_hod",
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    narocilo_id = db.Column(db.Integer, fk("narocilo.id", ondelete="RESTRICT"), nullable=False)
    jed_id = db.Column(db.Integer, fk("jed.id", ondelete="RESTRICT"), nullable=False)
    kolicina = db.Column(db.Integer, nullable=False)
    cena = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    hod = db.Column(db.Integer)


class Nabava(db.Model):
    __tablename__ = "nabava"
    __table_args__ = (
        CheckConstraint(
            "status IN ('naroceno', 'dobavljeno')",
            name="ck_nabava_status",
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    jed_id = db.Column(db.Integer, fk("jed.id", ondelete="RESTRICT"), nullable=False)
    administrator_id = db.Column(db.Integer, fk("uporabnik.id", ondelete="RESTRICT"), nullable=False)
    kolicina = db.Column(db.Integer, nullable=False)
    znesek = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    naroceno_ob = db.Column(db.DateTime(timezone=True), nullable=False)
    dobavljeno_ob = db.Column(db.DateTime(timezone=True))


class Transakcija(db.Model):
    __tablename__ = "transakcija"
    __table_args__ = (
        CheckConstraint(
            "vrsta IN ('prodaja', 'nabava')",
            name="ck_transakcija_vrsta",
        ),
        CheckConstraint(
            "(vrsta = 'prodaja' AND narocilo_id IS NOT NULL AND nabava_id IS NULL) OR "
            "(vrsta = 'nabava' AND nabava_id IS NOT NULL AND narocilo_id IS NULL)",
            name="ck_transakcija_veza",
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    vrsta = db.Column(db.String(20), nullable=False)
    narocilo_id = db.Column(db.Integer, fk("narocilo.id", ondelete="RESTRICT"), unique=True)
    nabava_id = db.Column(db.Integer, fk("nabava.id", ondelete="RESTRICT"), unique=True)
    znesek = db.Column(db.Numeric(10, 2), nullable=False)
    cas = db.Column(db.DateTime(timezone=True), nullable=False)
