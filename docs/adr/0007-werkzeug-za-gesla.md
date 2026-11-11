---
status: sprejeto
datum: 2026-11-11
avtor: Stefan Vujicic
---

# Werkzeug za zgoščevanje gesel

## Kontekst in opis problema

Gost, natakar, kuhar in administrator se prijavijo z geslom. Gesla ne sme biti v bazi v čistem besedilu. Vprašanje je, kako geslo zgoščiti in kasneje preveriti ob prijavi.

## Obravnavane možnosti

* Shranjevanje gesla v čistem besedilu
* Lastna zgoščitev z eno zgoščevalno funkcijo
* Werkzeug (`generate_password_hash`, `check_password_hash`)

## Sprejeta odločitev

Izbrana možnost: »Werkzeug za zgoščevanje in preverjanje gesel«, ker pride s Flaskom in že nudi varno zgoščitev ter preverjanje. Čisto besedilo je nesprejemljivo. Lastna zgoščitev bi tvegala napačno sol in primerjavo.

V bazi je samo `geslo_hash`. Ob registraciji ali ustvarjanju računa se geslo zgošči. Ob prijavi se primerja z zgoščeno vrednostjo.

### Posledice

* Dobro, ker iz baze ni mogoče prebrati gesla v čistem besedilu.
* Dobro, ker ni dodatne knjižnice: Werkzeug je že odvisnost Flaska.
* Slabo, ker pozabljenega gesla ni mogoče obnoviti iz zgoščene vrednosti; potreben je nov vnos.
* Slabo, ker mora vsaka pot, ki nastavi geslo, klicati isto zgoščitev.

### Potrditev

V modelu uporabnika je `geslo_hash`. Prijava uporablja `check_password_hash`. Registracija in ustvarjanje osebja uporabljata `generate_password_hash`.

## Prednosti in slabosti možnosti

### Čisto besedilo

* Dobro, ker je primerjava enostavna.
* Slabo, ker uhajanje baze razkrije vsa gesla.

### Lastna zgoščitev

* Dobro, ker ni dodatnega uvoza.
* Slabo, ker je enostavno narediti napako pri soli, algoritmu ali primerjavi.

### Werkzeug

* Dobro, ker je preverjena in že na voljo v Flask okolju.
* Slabo, ker je API vezan na njen format zgoščene vrednosti.

## Dodatne informacije

Odločitev velja, dokler prijava ostane z geslom v isti bazi. Če bi kasneje prišla zunanja prijava, se ta zapis dopolni.
