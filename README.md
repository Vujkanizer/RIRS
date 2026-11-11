# Glass

Spletna aplikacija za vodenje enega lokala: restavracije, kavarne ali hotelske restavracije. Pokrije pot od rezervacije mize do postrežene jedi, zaloge in zaključenega računa.

Lastnik lokala jo uporablja kot administrator. Gost rezervira mizo, natakar vodi naročilo, kuhar pripravlja jedi.

## MVP

Prva delujoča različica pokriva funkcionalnosti 1–7 iz dokumentacije.

1. **Rezervacija mize z opombo.** Gost izbere datum, uro, število oseb, prosto mizo in lahko doda opombo.
2. **Pregled rezervacij.** Natakar vidi rezervacije izbranega dne: uro, mizo, gosta in opombo.
3. **Naročilo na mizi.** Natakar zasede mizo, odpre naročilo in doda jedi ter pijačo. Doda lahko samo tisto, kar je še na zalogi. Naročilo lahko odpre tudi brez rezervacije.
4. **Kuhinjski pregled.** Kuhar vidi jedi odprtih naročil po mizah. Zaslon se sam osveži.
5. **Status jedi.** Kuhar označi jed kot pripravljeno. Natakar jo označi kot postreženo. Pijačo postreže sam.
6. **Zaključek naročila.** Natakar zaključi račun. Aplikacija izračuna znesek, zapiše transakcijo, zmanjša zalogo in sprosti mizo.
7. **Skladišče.** Zaloga kuhinje in bara. Kuhar vidi kuhinjo. Natakar vidi, kaj je še na voljo. Razprodane postavke ni mogoče dodati.

### Potek

Gost rezervira → natakar vidi dan → zasede mizo in odpre naročilo → doda postavke → kuhar pripravi → natakar postreže → zaključi račun.

### Vloge

| Vloga | Kaj sme |
| --- | --- |
| Gost | Registracija, prijava, rezervacija, moje rezervacije, odpoved |
| Natakar | Rezervacije dneva, mize, naročilo, postrežba, zaključek računa |
| Kuhar | Odprte jedi, oznaka pripravljena, zaloga kuhinje |
| Administrator | Osebje, računi, pregled natakarja in kuhinje |

Administrator doda račune natakarja in kuharja. Gost se registrira sam.

## Tehnologije

- Frontend: React, Vite
- Backend: Python, Flask, Flask-SQLAlchemy, Flask-CORS
- Podatkovna baza: PostgreSQL, gonilnik psycopg
- Avtentikacija: JWT (Flask-JWT-Extended), gesla zgoščena z Werkzeug

## Struktura

```
RIRS/
├── README.md
├── docs/                 dokumentacija in ADR
├── backend/              Flask REST API
│   ├── app/
│   ├── init_db.py
│   └── requirements.txt
└── frontend/             React (Vite)
    └── src/
```

## Dokumentacija

- [Zasnova rešitve](docs/01-zasnova-resitve.md)
- [Funkcionalnosti in obseg](docs/02-funkcionalnosti-in-obseg.md)
- [Podatkovni model](docs/03-podatkovni-model.md)
- [Arhitektura in tehnološki sklad](docs/04-arhitektura-in-tehnoloski-sklad.md)
- [Uporabniške zgodbe](docs/05-uporabniske-zgodbe.md)
- [Wireframi](docs/06-wireframes.md)

### Arhitekturne odločitve

- [0001 — React ločen od Flask API-ja](docs/adr/0001-react-loceno-od-flask-api.md)
- [0002 — PostgreSQL za povezane podatke](docs/adr/0002-postgresql-za-povezane-podatke.md)
- [0003 — JWT za štiri vloge](docs/adr/0003-jwt-za-stiri-vloge.md)
- [0004 — Flask in SQLAlchemy za API](docs/adr/0004-flask-in-sqlalchemy-za-api.md)
- [0005 — Vite za React vmesnik](docs/adr/0005-vite-za-react-vmesnik.md)
- [0006 — Flask-JWT-Extended](docs/adr/0006-flask-jwt-extended.md)
- [0007 — Werkzeug za gesla](docs/adr/0007-werkzeug-za-gesla.md)
- [0008 — Flask-CORS](docs/adr/0008-flask-cors.md)
- [0009 — psycopg za PostgreSQL](docs/adr/0009-psycopg-za-postgresql.md)
- [0010 — python-dotenv](docs/adr/0010-python-dotenv.md)

## Lokalni zagon

Backend in frontend tečeta ločeno. Potrebna sta lokalni PostgreSQL (baza `glass`) in Node.js.

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
flask run
```

API je na `http://localhost:5000`. V `.env` sta `DATABASE_URL` in `JWT_SECRET`.

Začetni podatki, vključno z administratorjem:

```powershell
python init_db.py
```

Administrator: `admin@gmail.com` / `admin`. Gost se registrira sam. Natakarja in kuharja doda administrator.

### Frontend

```powershell
cd frontend
npm install
npm start
```

Vmesnik je na `http://localhost:5173`.
