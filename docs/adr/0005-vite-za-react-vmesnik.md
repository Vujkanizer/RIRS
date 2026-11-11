---
status: sprejeto
datum: 2026-11-11
avtor: Stefan Vujicic
---

# Vite za razvoj React vmesnika

## Kontekst in opis problema

Frontend je ločen React projekt. Med razvojem mora hitro naložiti zaslone, poslati zahteve na Flask API in ob spremembi kode osvežiti stran. Vprašanje je, katero orodje zgradi in požene ta vmesnik.

## Obravnavane možnosti

* Create React App
* Webpack nastavljen ročno
* Vite z uradnim vtičnikom za React

## Sprejeta odločitev

Izbrana možnost: »Vite z uradnim vtičnikom za React«, ker je zagon hiter, nastavitev kratka in zadostuje za ločen vmesnik, ki kliče API. Create React App je zastarel za nov projekt. Ročni Webpack bi zahteval več konfiguracije, ne da bi za MVP prinesel korist.

Zahteve proti Flasku grejo prek razvojnega strežnika na `localhost:5173`. API sprejme ta izvor z CORS.

### Posledice

* Dobro, ker `npm start` požene Vite in vmesnik je takoj na `http://localhost:5173`.
* Dobro, ker se sprememba komponente hitro vidi brez težke gradnje.
* Slabo, ker sta frontend in backend še vedno dva procesa; Vite ne nadomesti Flaska.
* Slabo, ker mora biti CORS na API-ju nastavljen za naslov Vite strežnika.

### Potrditev

V `frontend/package.json` je zagon prek Vite. V `frontend/` so React komponente. Klici gredo na Flask poti `/api/...`.

## Prednosti in slabosti možnosti

### Create React App

* Dobro, ker je bil dolgo privzeti začetek za React.
* Slabo, ker ni več vzdrževan za nove projekte in je zagon počasnejši.

### Ročni Webpack

* Dobro, ker omogoča polno prilagoditev gradnje.
* Slabo, ker MVP ne potrebuje te nastavitve; dodaja delo brez nove funkcionalnosti.

### Vite

* Dobro, ker je hiter zagon in majhna konfiguracija dovolj za ločen React vmesnik.
* Slabo, ker za produkcijsko namestitev še vedno potrebuje ločen zagon API-ja.

## Dodatne informacije

Odločitev velja za lokalni razvoj in prvo različico. Če se kasneje doda druga gradnja za produkcijo, ostane Vite kot orodje vmesnika, dokler frontend ostane React.
