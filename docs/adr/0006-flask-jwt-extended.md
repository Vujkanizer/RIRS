---
status: sprejeto
datum: 2026-11-11
avtor: Stefan Vujicic
---

# Flask-JWT-Extended za izdajo in preverjanje žetonov

## Kontekst in opis problema

Odločitev o JWT kot načinu prijave je že sprejeta. API mora žeton izdati ob prijavi, ga brati iz glave `Authorization` in iz njega vzeti identifikator ter vlogo. Vprašanje je, katera knjižnica to naredi v Flasku.

## Obravnavane možnosti

* Ročno podpisovanje z `PyJWT`
* Flask-JWT-Extended
* Lastna seja namesto knjižnice za JWT

## Sprejeta odločitev

Izbrana možnost: »Flask-JWT-Extended«, ker je narejena za Flask in pokrije izdajo dostopnega žetona, branje glave ter vezavo na poti. Ročni `PyJWT` bi zahteval lastno ovojnico okoli vsake zaščitene poti. Seja bi vrnila problem, ki ga ADR o JWT že zavrne.

V žetonu sta identifikator uporabnika in vloga. Tajni ključ je `JWT_SECRET` v `.env`.

### Posledice

* Dobro, ker je prijava in zaščita poti enaka za vse štiri vloge.
* Dobro, ker dekoratorji in pomožne funkcije knjižnice skrajšajo kodo okoli žetona.
* Slabo, ker je projekt vezan na to knjižnico; zamenjava bi zahtevala spremembo prijave in vseh zaščitenih poti.
* Slabo, ker mora biti `JWT_SECRET` nastavljen in dovolj dolg.

### Potrditev

Ob prijavi API vrne JWT. Zaščitene poti brez veljavnega žetona ali z napačno vlogo vrnejo napako. React hrani žeton in ga pošlje v glavi.

## Prednosti in slabosti možnosti

### Ročni PyJWT

* Dobro, ker je odvisnost manjša.
* Slabo, ker bi vsaka pot sama preverjala podpis, potek in vlogo.

### Flask-JWT-Extended

* Dobro, ker je prilagojena Flasku in pokrije izdajo ter preverjanje žetona.
* Slabo, ker dodaja še eno knjižnico v zaledni sklad.

### Lastna seja

* Dobro, ker odjava lahko takoj razveljavi prijavo.
* Slabo, ker ne ustreza ločenemu React in Flask procesu, kot ga že določa ADR o JWT.

## Dodatne informacije

Ta zapis dopolnjuje ADR o JWT za štiri vloge. Velja, dokler prijava ostane na Flask API-ju.
