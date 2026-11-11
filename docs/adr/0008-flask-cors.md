---
status: sprejeto
datum: 2026-11-11
avtor: Stefan Vujicic
---

# Flask-CORS za ločen React vmesnik

## Kontekst in opis problema

React teče na `http://localhost:5173`, Flask API na `http://localhost:5000`. Brskalnik obravnava to kot dva izvora. Brez dovoljenja CORS brskalnik zavrne odgovor API-ja. Vprašanje je, kako API sprejme zahteve z naslova vmesnika.

## Obravnavane možnosti

* Enako izvorno gostovanje Reacta in API-ja
* Ročne glave CORS v vsakem odgovoru
* Flask-CORS z dovoljenim izvorom Vite strežnika

## Sprejeta odločitev

Izbrana možnost: »Flask-CORS z dovoljenim izvorom Vite strežnika«, ker sta frontend in backend ločena procesa. Knjižnica doda potrebne glave. Ročne glave bi se ponavljale. Skupno gostovanje bi spremenilo arhitekturo ločenega Reacta in Flaska.

Dovoljen izvor je `http://localhost:5173`.

### Posledice

* Dobro, ker vmesnik lahko kliče API med lokalnim razvojem.
* Dobro, ker je dovoljen samo znan izvor, ne poljuben naslov.
* Slabo, ker mora biti seznam izvorov usklajen z naslovom frontend strežnika.
* Slabo, ker produkcijski naslov zahteva dopolnitev nastavitve.

### Potrditev

V ustvarjanju aplikacije je vklopljen CORS za Vite naslov. Klici iz Reacta na `/api/...` pridejo do Flaska.

## Prednosti in slabosti možnosti

### Enako izvorno gostovanje

* Dobro, ker CORS ni potreben.
* Slabo, ker bi zlomilo ločitev Reacta in Flaska iz ADR 0001.

### Ročne glave

* Dobro, ker ni dodatne knjižnice.
* Slabo, ker se glave zlahka pozabijo na novi poti ali napaki.

### Flask-CORS

* Dobro, ker enkratna nastavitev pokrije API.
* Slabo, ker dodaja odvisnost, vezano na lokalni razvojni naslov.

## Dodatne informacije

Odločitev velja za lokalni zagon. Če se doda produkcijski naslov vmesnika, se ga doda med dovoljene izvore.
