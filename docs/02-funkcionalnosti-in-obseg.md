# 02. Funkcionalnosti in obseg

## Uporabniške vloge

### Gost

Gost ima svoj račun, da lahko rezervira mizo in se kasneje vrne k isti rezervaciji.

- Lahko pregleduje jedilnik, odda rezervacijo z datumom, uro, številom oseb in opombo ter vidi in odpove svoje rezervacije.
- Ne vidi rezervacij drugih gostov. Ne odpira naročil, ne spreminja statusa jedi, ne ureja cen in ne upravlja z računi osebja.

### Natakar

Natakar dela z rezervacijami in z mizami med servisom. Preden jed ali pijačo doda na naročilo, vidi, ali je še na voljo.

- Vidi rezervacije izbranega dne, skupaj z opombo gosta. Mizo označi kot zasedeno, odpre naročilo in dodaja postavke. Pri jedi vidi razpoložljivost iz kuhinje, pri pijači razpoložljivost iz bara. Razprodane postavke ne more dodati. Jedi razporedi v hode. Odprto naročilo lahko prestavi na drugo prosto mizo. Vidi status vsake jedi in jed, ki jo odnese, označi kot postreženo. Naročilo zaključi in s tem sprosti mizo.
- Ne spreminja količin v skladišču, ne vnaša nabave in ne vidi prihodkov ter obračunov. Ne spreminja cen, ne ustvarja računov zaposlenih in ne označi jedi kot pripravljene. To stori kuhar.

### Kuhar

Kuhar dela s pripravo jedi in z zalogo kuhinje.

- Vidi odprta naročila, razvrščena po mizah. Če so jedi v hodih, vidi samo tekoči hod in naslednjega ne more pripraviti, dokler prejšnji ni postrežen. Zaslon sam ponovno prebere naročila, zato kuhar strani ne osvežuje ročno. Jed, ki jo je skuhal, označi kot pripravljeno. Vidi stanje robe v kuhinji: kaj je na zalogi in česa primanjkuje.
- Ne vidi zaloge bara in je ne spreminja. Ne vnaša nabave, ne zaključuje računov in ne vidi prihodkov. Ne označi jedi kot postrežene. To stori natakar, ko jed odnese na mizo.

### Administrator

Administrator vodi restavracijo in ima vpogled v denar, naročila in zalogo.

- Ustvari račune za natakarje in kuharje, ureja jedilnik in mize ter vidi pregled skladišča. V tabeli transakcij vidi vsako naročilo gosta. V tabeli nabava vidi vsako naročilo robe za kuhinjo in vsako naročilo pijače ter pripadajoče dobave. Iz teh podatkov izračuna prihodke in obračun restavracije za izbrani teden, mesec ali leto.
- Ne označuje jedi kot pripravljenih ali postreženih in ne briše zaključenih transakcij. Zgodovina naročil in nabave ostane.

## Predvidene funkcionalnosti

1. **Rezervacija mize z opombo** (MVP, domensko specifična). Gost izbere prosto mizo, datum, uro in število oseb ter doda opombo. Sistem zavrne rezervacijo, če je ista miza v tem terminu že zasedena.
2. **Pregled rezervacij in opomb** (MVP, domensko specifična). Natakar vidi rezervacije izbranega dne: uro, mizo, gosta in opombo, preden gost sede.
3. **Naročilo na mizi** (MVP, domensko specifična). Natakar odpre naročilo za zasedeno mizo in doda jedi ter pijačo. Naročilo lahko odpre tudi brez rezervacije. Doda lahko samo tisto, kar je še na voljo v kuhinji oziroma v baru.
4. **Kuhinjski pregled** (MVP, domensko specifična). Kuhar na svoji strani vidi jedi odprtih naročil, združene po številki mize. Če je naročilo razdeljeno na hode, vidi samo jedi tekočega hoda. Stran sama na nekaj sekund ponovno prebere naročila prek API-ja. Kuhar je ne osvežuje ročno.
5. **Status jedi(v teku strezenja)** (MVP, domensko specifična). Kuhar jed označi kot pripravljeno. Natakar vidi, česa še ni na mizi, in jed po postrežbi označi kot postreženo.
6. **Zaključek naročila in sprostitev mize** (MVP, domensko specifična). Natakar naročilo zaključi. Aplikacija izračuna znesek, zapiše transakcijo, zmanjša zalogo porabljene robe in mizo označi kot prosto.
7. **Skladišče in razpoložljivost robe** (MVP, domensko specifična). Aplikacija vodi zalogo kuhinje in zalogo pijače. Kuhar vidi stanje robe v kuhinji. Natakar vidi, kaj je še na voljo iz kuhinje in kaj iz bara. Ko zaloge zmanjka, postavka ni več na voljo za naročilo.
8. **Nabava in dobave.** Administrator v tabeli nabava vodi naročila robe za kuhinjo in naročila pijače. Ob dobavi se količina v ustreznem skladišču poveča. Vsaka taka naročila in dobava ostaneta v tabeli.
9. **Tabela transakcij.** Administrator vidi vsako naročilo gosta: mizo, natakarja, postavke, znesek in čas. V istem pregledu vidi tudi nabavne dobave, ločeno od prodaje.
10. **Prihodki in obračun.** Administrator za izbrani teden, mesec ali leto vidi prihodke od naročil in znesek nabave. Obračun sešteje zaključene transakcije in dobave v tem obdobju.
11. **Urejanje jedilnika.** Administrator doda jed ali pijačo, nastavi ceno in kategorijo ter jo poveže z zalogo, iz katere se ob prodaji odšteva.
12. **Odpoved rezervacije.** Gost odpove svojo potrjeno rezervacijo. Miza v tem terminu spet postane prosta za druge.
13. **Javni jedilnik.** Gost pred rezervacijo pregleda jedi in pijačo po kategorijah.
14. **Hodi postrežbe.** Natakar jedi enega naročila razporedi v zaporedne hode, na primer predjed, glavno jed in sladico. Kuhinja dobi v pripravo samo jedi tekočega hoda. Naslednji hod se odpre šele, ko je vsaka jed prejšnjega hoda označena kot postrežena. Kuhar ne more označiti jedi kasnejšega hoda kot pripravljene, dokler prejšnji hod ni končan. Pijača ni v hodu: natakar jo doda in postreže neodvisno od kuhinje.
15. **Prenos odprtega naročila na drugo mizo.** Če se gost presede, natakar odprto naročilo veže na drugo mizo. Prenos je dovoljen samo, če je nova miza prosta in nima svojega odprtega naročila. Postavke, hodi in status jedi ostanejo nespremenjeni, tekoči hod se ne začne znova. Prejšnja miza postane prosta. Kuhinja ob naslednjem branju vidi novo številko mize. Zaključenega naročila ni mogoče prestaviti.
16. **Izvoz obračuna v PDF.** Vodja tedenski, mesečni ali letni obračun shrani v PDF. Datoteka vsebuje prihodke od naročil in znesek nabave za izbrano obdobje, enako kot obračun na zaslonu.

Za prvo delujočo različico so funkcionalnosti 1–7. Vseh sedem je domensko specifičnih: rezervacija, opombe, naročilo glede na zalogo, kuhinjski pregled, status jedi do mize, zaključek z odštevanjem zaloge ter skladišče kuhinje in bara.

Nabava, transakcije in obračuni (8–10) so del iste aplikacije, ne kasnejša nadgradnja. Brez njih vodja nima vpogleda v naročila, dobave in prihodke. Izvoz tega obračuna v PDF (16) je prav tako del aplikacije.

## Kasnejše nadgradnje

1. QR-koda na mizi, prek katere gost naroči sam s telefona. Naročilo pride v isto kuhinjsko sliko in v isto zalogo.
2. Spletno plačilo zaključenega računa.
3. Opozorilo administratorju, ko zaloga jedi ali pijače pade pod nastavljeno mejo.
4. Predlog nabave. Vodja za izbrano obdobje vidi, katere jedi in pijače so se prodajale hitreje, kot jih je ostalo na zalogi. Predlog sam ne ustvari naročila. Šele ko ga potrdi, nastane vrstica v tabeli nabava.
5. Alergeni na jedilniku. Ob jedi se zapiše, katere alergene vsebuje. Gost jih pred rezervacijo vidi in lahko jedilnik zoži, na primer na jedi brez glutena.

## Out of scope

- Povezava z davčno blagajno in potrjevanje računov pri FURS. Aplikacija izračuna znesek, ne izda pa uradnega davčnega računa.
- Povezava z dostavnimi službami, kot sta Wolt in Glovo.
- Namenska mobilna aplikacija za Android ali iOS. Prva različica je odzivna spletna aplikacija.
- Več restavracij v eni namestitvi. Podatki veljajo za en lokal.
- Obračun plač, ur in izmen zaposlenih.
