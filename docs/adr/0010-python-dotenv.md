---
status: sprejeto
datum: 2026-11-11
avtor: Stefan Vujicic
---

# python-dotenv za lokalne skrivnosti

## Kontekst in opis problema

API potrebuje `DATABASE_URL` in `JWT_SECRET`. Teh vrednosti ne sme biti v kodi ali v javnem repozitoriju. Vprašanje je, od kod jih Flask prebere ob lokalnem zagonu.

## Obravnavane možnosti

* Vrednosti zapisane v kodi
* Sistemske spremenljivke okolja brez datoteke
* Datoteka `.env` in knjižnica `python-dotenv`

## Sprejeta odločitev

Izbrana možnost: »`.env` z `python-dotenv`«, ker omogoča lokalne skrivnosti zunaj kode. Primer je `.env.example` brez pravih vrednosti. Sistemske spremenljivke same so v redu za produkcijo, a za vaje je datoteka `.env` jasnejša. Vrednosti v kodi so nesprejemljive.

Ob zagonu aplikacija naloži `.env`. Datoteka je v `.gitignore`.

### Posledice

* Dobro, ker skrivnosti niso v repozitoriju.
* Dobro, ker nov razvijalec skopira `.env.example` in dopolni svoje vrednosti.
* Slabo, ker pozabljena `.env` povzroči napako ob zagonu.
* Slabo, ker mora biti `.env` na vsakem računalniku nastavljena posebej.

### Potrditev

V backendu se naloži `.env`. `DATABASE_URL` in `JWT_SECRET` prideta iz okolja. V repozitoriju sta samo primer in dokumentacija zagona.

## Prednosti in slabosti možnosti

### Vrednosti v kodi

* Dobro, ker zagon deluje brez datoteke.
* Slabo, ker skrivnost pride v Git.

### Samo sistemske spremenljivke

* Dobro, ker ni datoteke v mapi projekta.
* Slabo, ker je lokalni zagon manj pregleden za vaje.

### python-dotenv

* Dobro, ker loči skrivnosti od kode in omogoči primer v `.env.example`.
* Slabo, ker dodaja majhno odvisnost in zahteva lokalno datoteko.

## Dodatne informacije

Odločitev velja za lokalni razvoj. V produkciji smejo iste ključe podati sistemske spremenljivke okolja.
