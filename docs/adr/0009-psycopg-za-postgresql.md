---
status: sprejeto
datum: 2026-11-11
avtor: Stefan Vujicic
---

# psycopg za povezavo s PostgreSQL

## Kontekst in opis problema

Podatki lokala so v PostgreSQL. SQLAlchemy potrebuje gonilnik, ki odpre povezavo in izvede poizvedbe. Vprašanje je, kateri gonilnik uporabiti.

## Obravnavane možnosti

* `psycopg2`
* `psycopg` (različica 3)
* Drugi dialekt ali posrednik

## Sprejeta odločitev

Izbrana možnost: »psycopg (različica 3)«, ker je trenutni uradni gonilnik za PostgreSQL v Pythonu in deluje s SQLAlchemy prek `DATABASE_URL`. Starejši `psycopg2` bi deloval, a ni več glavna linija razvoja. Drug posrednik bi dodal plast brez koristi za en lokalni API.

V `.env` je `DATABASE_URL` v obliki, ki jo SQLAlchemy in psycopg razumeta. Nameščen je paket `psycopg[binary]`.

### Posledice

* Dobro, ker API bere in piše v PostgreSQL prek ene znane poti.
* Dobro, ker binary paket olajša lokalno namestitev na Windowsu.
* Slabo, ker je zagon odvisen od delujočega PostgreSQL strežnika in pravilnega `DATABASE_URL`.
* Slabo, ker zamenjava gonilnika zahteva preverbo URL in odvisnosti.

### Potrditev

Backend se poveže na bazo `glass` prek `DATABASE_URL`. Modeli in poizvedbe tečejo prek SQLAlchemy in psycopg.

## Prednosti in slabosti možnosti

### psycopg2

* Dobro, ker je dolgo uporabljan z SQLAlchemy.
* Slabo, ker je starejša linija; novi projekti grejo na psycopg 3.

### psycopg 3

* Dobro, ker je trenutni gonilnik in podpira sodobni Python sklad.
* Slabo, ker mora biti različica usklajena z URL shemo v nastavitvah.

### Drug posrednik

* Dobro, ker bi lahko skril podrobnosti povezave.
* Slabo, ker MVP potrebuje neposredno, preverljivo povezavo API–baza.

## Dodatne informacije

Ta zapis dopolnjuje ADR o PostgreSQL. Velja, dokler ostane ena PostgreSQL baza za lokal.
