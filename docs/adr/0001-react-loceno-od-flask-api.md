---
status: sprejeto
datum: 2026-10-27
avtor: Stefan Vujicic
---

# React vmesnik je ločen od Flask API-ja

## Kontekst in opis problema

Glass ima štiri vloge z različnimi zasloni: gost, natakar, kuhar in administrator. Pravila so skupna: zaseden termin, zaloga, status jedi, račun in nabava. Vprašanje je, ali zaslone in pravila držati v enem Flask projektu ali ju ločiti.

## Obravnavane možnosti

* Flask z Jinja predlogami, ki hkrati izrišejo strani in izvajajo pravila
* React za zaslone in Flask samo kot REST API
* React in ločen zaledni del v drugem jeziku

## Sprejeta odločitev

Izbrana možnost: »React za zaslone in Flask samo kot REST API«, ker so zasloni različni, pravila pa morajo ostati na enem mestu. Isti API uporabljajo vse vloge. Drug jezik za zaledni del bi dodal drugi razvojni sklad, ne da bi rešil problem ločitve.

### Posledice

* Dobro, ker sprememba zaslona ne spremeni pravil za zalogo, termin ali račun. Ločitev ima predvidljiv vzdrževalni odtis: vmesnik in API se spreminjata vsak v svoji mapi.
* Dobro, ker React in Flask tečeta kot dva procesa, zato je jasno, kje je prikaz in kje so podatki.
* Slabo, ker je lokalno treba zagnati oba procesa in API mora sprejeti zahteve z naslova Reacta.
* Slabo, ker je za prvo različico več nastavitev kot pri eni Flask aplikaciji s predlogami.

### Potrditev

V `frontend/` je samo vmesnik, v `backend/` samo API. Zaslon ne računa zneska računa in ne piše v bazo. To se vidi v diagramu v dokumentu o arhitekturi.

## Prednosti in slabosti možnosti

### Flask z Jinja predlogami

* Dobro, ker je en proces in en zagon.
* Slabo, ker se pravila in izris strani mešajo v istih pogledih, ko dobijo štiri vloge različne zaslone.

### React in Flask REST API

* Dobro, ker so pravila na strežniku, zasloni pa samo pokažejo rezultat in pošljejo dejanje.
* Slabo, ker sta za lokalni zagon potrebna `flask run` in `npm start`.

### React in zaledni del v drugem jeziku

* Dobro, ker bi vmesnik ostal ločen.
* Slabo, ker projekt že stoji na Pythonu in Flasku. Drug sklad ne reši nobenega odprtega problema.

## Dodatne informacije

Odločitev velja, dokler vse štiri vloge uporabljajo isti API. Če bi nastal drugi odjemalec, se ta zapis ne zamenja, dokler pravila ostanejo v Flasku.
