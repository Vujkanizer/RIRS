---
status: sprejeto
datum: 2026-11-11
avtor: Stefan Vujicic
---

# Flask in SQLAlchemy za REST API

## Kontekst in opis problema

Pravila lokala živijo na strežniku: rezervacija, naročilo, zaloga, status jedi in zaključek računa. Vmesnik je ločen React. Vprašanje je, kateri Python ogrodje izpostavi REST poti in kako API piše v PostgreSQL.

## Obravnavane možnosti

* Django z ORM in vgrajenimi predlogami
* FastAPI z ločenim ORM
* Flask z Flask-SQLAlchemy

## Sprejeta odločitev

Izbrana možnost: »Flask z Flask-SQLAlchemy«, ker projekt potrebuje tanek REST API, ne celotnega spletnega ogrodja s predlogami. Flask drži poti in pravila v majhnih modulih. SQLAlchemy prek Flask-SQLAlchemy poveže modele z PostgreSQL in tujimi ključi. Django bi prinesel več plasti, kot jih MVP potrebuje. FastAPI bi zahteval drugi nabor knjižnic za ORM in JWT, ne da bi rešil problem, ki ga Flask že pokrije.

### Posledice

* Dobro, ker je API razdeljen po področjih: prijava, rezervacije, naročila, kuhinja, zaloge, računi.
* Dobro, ker modeli v kodi sledijo podatkovnemu modelu in tujim ključem.
* Slabo, ker Flask sam ne vsili strukture; razvijalec mora poti in modele držati urejene.
* Slabo, ker je shema vezana na SQLAlchemy modele in sprememba tabele zahteva uskladitev kode.

### Potrditev

V `backend/app/` so blueprinti in modeli. Do baze gre samo API. React ne piše neposredno v PostgreSQL.

## Prednosti in slabosti možnosti

### Django

* Dobro, ker ima ORM in upravljanje uporabnikov že vključeno.
* Slabo, ker je narejen za večje monolitne aplikacije. Ločen React bi uporabil le del ogrodja.

### FastAPI

* Dobro, ker je namenjen API-jem in ima jasen opis shem.
* Slabo, ker bi projekt moral ločeno izbrati ORM, migracije in JWT sklad, kar bi podvojilo odločitve.

### Flask in Flask-SQLAlchemy

* Dobro, ker je dovolj lahek za MVP in dovolj jasen za REST poti z vlogami.
* Slabo, ker ne prinese admin vmesnika ali migracij iz škatle.

## Dodatne informacije

Odločitev velja, dokler ostane en Flask API za vse štiri vloge. Če bi nastal drugi zaledni servis, se ta zapis ne zamenja, dokler pravila lokala ostanejo v Flasku.
