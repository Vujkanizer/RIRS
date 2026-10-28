---
status: sprejeto
datum: 2026-10-27
avtor: Stefan Vujicic
---

# JWT za prijavo in štiri vloge

## Kontekst in opis problema

React in Flask tečeta ločeno. Gost se registrira sam, natakarja in kuharja doda administrator. Vsaka pot sme odgovoriti samo tisti vlogi, ki sme dejanje izvesti: kuhar ne zaključi računa, gost ne odpre naročila, natakar ne vidi obračuna. Vprašanje je, kako API ve, kdo kliče, ne da bi hranil prijavo v svojem pomnilniku.

## Obravnavane možnosti

* Seja na strežniku in piškotek v brskalniku
* JWT v glavi `Authorization`, v žetonu sta identifikator in vloga
* Eno skupno geslo za ves lokal

## Sprejeta odločitev

Izbrana možnost: »JWT v glavi Authorization, v žetonu sta identifikator in vloga«, ker sta vmesnik in API dva procesa. Žeton potuje z vsakim klicem, zato Flasku ni treba hraniti sej. Vloga v žetonu zadošča, da pot zavrne napačnega uporabnika. Skupno geslo ne loči gosta od natakarja.

Geslo se v bazo zapiše samo zgoščeno, z Werkzeug. Javne registracije za zaposlene ni.

### Posledice

* Dobro, ker je ena prijava dovolj za vse štiri vloge in vsaka pot preveri vlogo posebej.
* Dobro, ker React ne hrani gesla, ampak samo žeton.
* Slabo, ker žeton velja, dokler ne poteče. Odjava na strežniku ga ne zbriše, če ne vodimo seznama preklicanih žetonov.
* Slabo, ker mora biti `JWT_SECRET` zunaj kode, v `.env`.

### Potrditev

Zaščitene poti zahtevajo glavo `Authorization`. Ob prijavi API vrne JWT. Klic brez žetona ali z napačno vlogo ne spremeni naročila, zaloge ali obračuna.

## Prednosti in slabosti možnosti

### Seja na strežniku

* Dobro, ker odjava sejo takoj razveljavi.
* Slabo, ker mora Flask sejo vezati na piškotek, React pa teče na drugem naslovu. To doda stanje, ki ga ločen API sicer nima.

### JWT

* Dobro, ker je klic samostojen: identifikator in vloga sta v žetonu.
* Slabo, ker preklic žetona pred potekom ni samoumeven.

### Skupno geslo lokala

* Dobro, ker ni registracije.
* Slabo, ker ne loči vlog in ne pove, kateri natakar je odprl naročilo.

## Dodatne informacije

Če bo treba žeton preklicati pred potekom, se to zapiše v nov zapis. Ta odločitev ostane, dokler vloge ostanejo štiri in prijava ostane na API-ju.
