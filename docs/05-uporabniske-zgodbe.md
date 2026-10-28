# 05. Uporabniške zgodbe

Zgodbe pokrivajo funkcionalnosti 1–16 iz naloge 1. Vloge so gost, natakar, kuhar in administrator. Lastnik restavracije, kavarne ali hotela v aplikaciji dela kot administrator.

## US-01

**Povezana funkcionalnost:** 1. Rezervacija mize z opombo (MVP)

**Vloga:** gost

**Zgodba:** Kot gost želim rezervirati prosto mizo za izbran datum, uro in število oseb ter dodati opombo, da osebje ob prihodu ve, kaj potrebujem.

**Acceptance criteria:**

1. Gost lahko rezervacijo shrani šele, ko je prijavljen in je vnesel datum, uro, število oseb in mizo.
2. Na izbiro so samo mize, ki v izbranem terminu nimajo druge potrjene rezervacije. Termin traja 120 minut, razen če gost vnese drugo trajanje.
3. Opomba ni obvezna. Če jo gost vpiše, se shrani na tej rezervaciji.
4. Če se termin prekriva z že potrjeno rezervacijo iste mize, se nova rezervacija ne shrani in gost vidi sporočilo, da miza ni prosta.
5. Shranjena rezervacija ima status potrjena in gost jo vidi na seznamu svojih rezervacij.

## US-02

**Povezana funkcionalnost:** 2. Pregled rezervacij in opomb (MVP)

**Vloga:** natakar

**Zgodba:** Kot natakar želim pred servisom videti rezervacije izbranega dne skupaj z opombo gosta, da vem, kdo pride, kdaj in na kaj moram biti pozoren.

**Acceptance criteria:**

1. Natakar izbere dan in vidi samo rezervacije, katerih začetek pade na ta dan.
2. Vsaka vrstica pokaže uro, številko mize, ime in priimek gosta ter opombo.
3. Če opombe ni, je polje prazno, vrstica pa je vseeno vidna.
4. Potrjene rezervacije so na seznamu. Odpovedane niso.
5. Natakar ne vidi rezervacij drugega dne, dokler dneva ne zamenja.

## US-03

**Povezana funkcionalnost:** 3. Naročilo na mizi (MVP)

**Vloga:** natakar

**Zgodba:** Kot natakar želim za zasedeno mizo odpreti naročilo in nanj dodati jedi ter pijačo, da kuhinja in bar dobita to, kar je gost izbral.

**Acceptance criteria:**

1. Natakar odpre naročilo samo za mizo s statusom zasedena.
2. Na eni mizi je hkrati največ eno odprto naročilo.
3. Naročilo lahko odpre tudi brez rezervacije. Polje rezervacije je takrat prazno.
4. Jed iz kuhinje ali pijača iz bara se doda samo, če je njena zaloga večja od nič. Sicer gumb za dodajanje ni aktiven.
5. Nova postavka dobi status čaka in ceno, ki jo ima jed v jedilniku v trenutku dodajanja.

## US-04

**Povezana funkcionalnost:** 4. Kuhinjski pregled (MVP)

**Vloga:** kuhar

**Zgodba:** Kot kuhar želim na enem zaslonu videti jedi odprtih naročil po mizah, da vem, kaj moram pripraviti, ne da bi osveževal stran.

**Acceptance criteria:**

1. Kuhar vidi samo postavke, katerih jed pripada skladišču kuhinja. Pijače na zaslonu ni.
2. Postavke istega naročila so združene pod številko mize.
3. Če ima naročilo hode, so vidne samo jedi tekočega hoda. Tekoči hod je najnižji hod, v katerem še obstaja jed, ki ni postrežena.
4. Ko natakar doda jed tekočega hoda, se ta na zaslonu pojavi brez ročnega osveževanja, najpozneje v 10 sekundah.
5. Zaključeno naročilo s kuhinjskega zaslona izgine.

## US-05

**Povezana funkcionalnost:** 5. Status jedi v teku strežbe (MVP)

**Vloga:** kuhar in natakar

**Zgodba:** Kot kuhar želim jed označiti kot pripravljeno, kot natakar pa kot postreženo, da je za vsako mizo razvidno, kaj je že na mizi in kaj še ni.

**Acceptance criteria:**

1. Kuhar lahko jed v statusu čaka označi samo kot pripravljena.
2. Kuhar jedi ne more označiti kot postrežena.
3. Natakar na naročilu mize vidi status vsake postavke: čaka, pripravljena ali postrežena.
4. Natakar lahko kot postreženo označi jed, ki je pripravljena. Jedi, ki še čaka, tako ne more označiti.
5. Pijačo, ki nima hoda in ne gre v kuhinjo, natakar označi kot postreženo sam, brez oznake kuharja.

## US-06

**Povezana funkcionalnost:** 6. Zaključek naročila in sprostitev mize (MVP)

**Vloga:** natakar

**Zgodba:** Kot natakar želim ob odhodu gostov zaključiti naročilo, da se izračuna znesek, zmanjša zaloga in miza sprosti za naslednje goste.

**Acceptance criteria:**

1. Zaključi se lahko samo naročilo s statusom odprto.
2. Skupni znesek je seštevek količine krat cena po vseh postavkah tega naročila.
3. Ob zaključku nastane natanko ena transakcija vrste prodaja s tem zneskom, mizo, natakarjem in časom zaključka.
4. Zaloga vsake jedi in pijače na naročilu se zmanjša za naročeno količino.
5. Naročilo dobi status zaključeno, miza pa status prosta.

## US-07

**Povezana funkcionalnost:** 7. Skladišče in razpoložljivost robe (MVP)

**Vloga:** kuhar in natakar

**Zgodba:** Kot kuhar želim videti, česa v kuhinji primanjkuje, kot natakar pa, kaj je še na voljo v kuhinji in v baru, da gostu ne obljubim razprodane jedi.

**Acceptance criteria:**

1. Kuhar vidi naziv in zalogo samo za jedi, katerih skladišče je kuhinja.
2. Kuhar ne vidi zaloge bara in je ne more spremeniti.
3. Natakar pri dodajanju na naročilo vidi, ali je jed na voljo v kuhinji in ali je pijača na voljo v baru.
4. Ko je zaloga enaka nič, te postavke ni mogoče dodati na naročilo.
5. Natakar in kuhar količine na zalogi ne moreta vpisati ročno.

## US-08

**Povezana funkcionalnost:** 8. Nabava in dobave

**Vloga:** administrator

**Zgodba:** Kot administrator želim naročiti jed ali pijačo in ob prejemu blaga povečati zalogo, da ostaneta naročilo in dobava zapisana.

**Acceptance criteria:**

1. Administrator vnese nabavo za eno jed ali eno pijačo, z količino in zneskom.
2. Nova vrstica ima status naročeno in prazen čas dobave.
3. Ko administrator vrstico označi kot dobavljeno, se naročena količina prišteje zalogi te jedi in vpiše se čas dobave.
4. Vrstica po dobavi ostane v tabeli nabava. Ne izbriše se.
5. Natakar in kuhar obrazca za nabavo ne odpreta.

## US-09

**Povezana funkcionalnost:** 9. Tabela transakcij

**Vloga:** administrator

**Zgodba:** Kot administrator želim videti vsako zaključeno naročilo in vsako dobavo, da imam ločen pregled prodaje in nabave.

**Acceptance criteria:**

1. V seznamu prodaje je vsako zaključeno naročilo: številka mize, natakar, postavke, znesek in čas.
2. Odprto naročilo v tem seznamu ni.
3. Dobave so v ločenem seznamu: jed ali pijača, količina, znesek in čas dobave.
4. Prodaja in nabava sta označeni tako, da ju ni mogoče zamenjati za isto vrsto prometa.
5. Administrator zaključene transakcije ne more izbrisati.

## US-10

**Povezana funkcionalnost:** 10. Prihodki in obračun

**Vloga:** administrator

**Zgodba:** Kot administrator želim za izbrani teden, mesec ali leto videti prihodke in znesek nabave, da vem, kako je lokal v tem obdobju posloval.

**Acceptance criteria:**

1. Administrator izbere eno od obdobij: teden, mesec ali leto, in začetni datum tega obdobja.
2. Prihodki so vsota zneskov transakcij vrste prodaja, katerih čas pade v izbrano obdobje.
3. Nabava je vsota zneskov transakcij vrste nabava v istem obdobju.
4. Transakcija zunaj obdobja v noben seštevek ni vključena.
5. Na zaslonu sta prihodki in nabava izpisana kot dva ločena zneska.

## US-11

**Povezana funkcionalnost:** 11. Urejanje jedilnika

**Vloga:** administrator

**Zgodba:** Kot administrator želim dodati jed ali pijačo s ceno, kategorijo in skladiščem, da natakar naroča samo tisto, kar lokal res ponuja.

**Acceptance criteria:**

1. Administrator shrani jed šele, ko vpiše naziv, ceno, kategorijo in skladišče kuhinja ali bar.
2. Kategorija je ena od: predjed, glavna jed, sladica, pijača.
3. Brez izbranega skladišča se jed ne shrani.
4. Sprememba cene v jedilniku ne spremeni cene na postavkah že shranjenih naročil.
5. Natakar, kuhar in gost jedilnika ne urejajo.

## US-12

**Povezana funkcionalnost:** 12. Odpoved rezervacije

**Vloga:** gost

**Zgodba:** Kot gost želim odpovedati svojo potrjeno rezervacijo, da se miza sprosti za nekoga drugega.

**Acceptance criteria:**

1. Gost vidi samo svoje rezervacije in lahko odpove samo tisto s statusom potrjena.
2. Po odpovedi ima rezervacija status odpovedana.
3. Ista miza v istem terminu je takoj na voljo za novo potrjeno rezervacijo.
4. Gost tuje rezervacije ne vidi in je ne more odpovedati.
5. Odpovedana rezervacija se natakarju ne prikaže med aktivnimi rezervacijami dneva.

## US-13

**Povezana funkcionalnost:** 13. Javni jedilnik

**Vloga:** gost

**Zgodba:** Kot gost želim pred rezervacijo pregledati jedi in pijačo po kategorijah, da vem, kaj lokal ponuja.

**Acceptance criteria:**

1. Gost vidi jedi razvrščene v kategorije predjed, glavna jed, sladica in pijača.
2. Pri vsaki jedi sta vidna naziv in prodajna cena.
3. Količina na zalogi gostu ni vidna.
4. Kategorija brez jedi ne pokaže nobene postavke in ne javi napake.
5. Jedilnik je viden tudi gostu, ki rezervacije še ni oddal.

## US-14

**Povezana funkcionalnost:** 14. Hodi postrežbe

**Vloga:** natakar

**Zgodba:** Kot natakar želim jedi enega naročila razporediti v hode, da kuhinja pripravlja naslednji hod šele, ko je prejšnji na mizi.

**Acceptance criteria:**

1. Natakar jedi iz kuhinje dodeli hod 1, 2 ali 3.
2. Pijača hoda nima in v kuhinjski pregled ne gre.
3. Kuhar vidi samo jedi tekočega hoda te mize.
4. Kuhar ne more označiti jedi višjega hoda kot pripravljene, dokler ni vsaka jed nižjega hoda postrežena.
5. Ko natakar označi zadnjo jed hoda kot postreženo, se na kuhinjskem zaslonu pokažejo jedi naslednjega hoda.

## US-15

**Povezana funkcionalnost:** 15. Prenos odprtega naročila na drugo mizo

**Vloga:** natakar

**Zgodba:** Kot natakar želim odprto naročilo prestaviti na drugo prosto mizo, da gostje lahko sedejo drugam, kuhinja pa še vedno pripravlja iste jedi.

**Acceptance criteria:**

1. Prestavi se lahko samo naročilo s statusom odprto. Zaključeno naročilo nima te akcije.
2. Ciljna miza mora biti prosta in ne sme imeti svojega odprtega naročila.
3. Prenos na mizo, na kateri naročilo že je, ni dovoljen in se ne shrani.
4. Po prenosu ostanejo postavke, količine, cene, hodi in statusi jedi enaki. Tekoči hod se ne začne znova.
5. Prejšnja miza dobi status prosta, nova status zasedena, kuhinjski pregled pa pokaže novo številko mize.

## US-16

**Povezana funkcionalnost:** 16. Izvoz obračuna v PDF

**Vloga:** administrator

**Zgodba:** Kot administrator želim tedenski, mesečni ali letni obračun shraniti v PDF, da imam iste zneske tudi zunaj zaslona.

**Acceptance criteria:**

1. Izvoz je na voljo samo administratorju. Gost, natakar in kuhar gumba za PDF ne vidijo.
2. Administrator izbere isto vrsto obdobja kot pri obračunu: teden, mesec ali leto.
3. PDF vsebuje prihodke od naročil in znesek nabave za to obdobje.
4. Oba zneska v PDF sta enaka zneskoma, ki sta za isto obdobje izpisana na zaslonu obračuna.
5. Brskalnik prenese datoteko PDF na napravo administratorja.
