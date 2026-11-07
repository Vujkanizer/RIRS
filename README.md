# Glass

Spletna aplikacija za vodenje enega lokala: restavracije, kavarne ali hotelske restavracije. Pokrije pot od rezervacije mize do postrežene jedi, zaloge in obračuna.

Lastnik lokala jo uporablja za pregled poslovanja. Gost rezervira mizo, natakar vodi naročilo, kuhar pripravlja jedi po hodih.

## Tehnologije

- Frontend: React
- Backend: Python, Flask, Flask-SQLAlchemy
- Podatkovna baza: PostgreSQL, gonilnik psycopg
- Avtentikacija: JWT (Flask-JWT-Extended), gesla zgoščena z Werkzeug

## Dokumentacija

- [Zasnova rešitve](docs/01-zasnova-resitve.md)
- [Funkcionalnosti in obseg](docs/02-funkcionalnosti-in-obseg.md)
- [Podatkovni model](docs/03-podatkovni-model.md)
- [Arhitektura in tehnološki sklad](docs/04-arhitektura-in-tehnoloski-sklad.md)
- [Uporabniške zgodbe](docs/05-uporabniske-zgodbe.md)
- [Wireframi](docs/06-wireframes.md)
- [Arhitekturne odločitve](docs/adr/)

## Lokalni zagon

Backend in frontend tečeta ločeno.

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
flask run
```

API je na `http://localhost:5000`. V `.env` sta `DATABASE_URL` in `JWT_SECRET`. Baza se imenuje `glass`.

### Frontend

```powershell
cd frontend
npm install
npm start
```

Vmesnik je na `http://localhost:5173`.
