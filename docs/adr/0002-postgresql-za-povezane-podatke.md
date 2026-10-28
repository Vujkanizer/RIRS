---
status: sprejeto
datum: 2026-10-27
avtor: Stefan Vujicic
---

# PostgreSQL za povezane podatke lokala

## Kontekst in opis problema

Naročilo pripada mizi in natakarju, postavka pripada naročilu in jedi, jed pripada skladišču, nabava in transakcija se navezujeta na isto jed oziroma naročilo. Ob zaključku računa se morajo znesek, zaloga in transakcija ujemati. Vprašanje je, katera shramba to drži skupaj brez podvojenih zapisov.

## Obravnavane možnosti

* SQLite v eni datoteki
* Dokumentna baza, kjer je naročilo shranjeno kot en dokument
* PostgreSQL s tujimi ključi

## Sprejeta odločitev

Izbrana možnost: »PostgreSQL s tujimi ključi«, ker so rezervacija, naročilo, postavka, zaloga, nabava in transakcija med seboj povezani. Tuji ključ prepreči naročilo na mizo, ki ne obstaja. SQLite bi za enega razvijalca zadoščal pri vajah, nima pa istega strežniškega modela, kot ga lokal uporablja, ko API in baza tečeta ločeno. Dokumentna baza bi jed, ki je hkrati v naročilu in v nabavi, podvajala.

### Posledice

* Dobro, ker shema iz podatkovnega modela ostane ena in preverljiva.
* Dobro, ker seštevek obračuna bere shranjene transakcije, ne pa kopij zneskov po dokumentih.
* Slabo, ker PostgreSQL teče kot svoj proces in ga je treba lokalno namestiti.
* Slabo, ker je sprememba sheme počasnejša kot pri eni datoteki SQLite.

### Potrditev

Do baze dostopa samo API. V shemi so tuji ključi med uporabnikom, mizo, rezervacijo, jedjo, naročilom, postavko, nabavo in transakcijo.

## Prednosti in slabosti možnosti

### SQLite

* Dobro, ker ni ločene namestitve strežnika.
* Slabo, ker je namenjen eni datoteki v procesu aplikacije, ne ločenemu API-ju in bazi, kot ju predvideva zagon.

### Dokumentna baza

* Dobro, ker je eno naročilo mogoče prebrati kot en zapis.
* Slabo, ker ista jed živi v jedilniku, na postavki, v zalogi in v nabavi. Brez tujih ključev se ti zapisi razidejo.

### PostgreSQL

* Dobro, ker tuji ključi držijo povezave, ki jih model že opisuje.
* Slabo, ker zahteva lokalni strežnik in `DATABASE_URL`.

## Dodatne informacije

Baza se imenuje `glass` in velja za en lokal. Več restavracij v eni namestitvi je zunaj obsega, zato shema nima tabele verige lokalov.
