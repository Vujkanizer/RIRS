# 01. Zasnova rešitve

## "Glass"

**Glass** je spletna aplikacija za vodenje restavracije. Pokrije celotno pot od rezervacije mize do trenutka, ko je hrana prinesena na mizo.

## Namen rešitve in problem, ki ga rešitev naslavlja

V manjši restavraciji je pot od rezervacije do hrane na mizi razdeljena med zvezek, listek in ustno obvestilo. Rezervacija ostane pri natakarju, naročilo se prepiše za kuhinjo, opomba gosta se izgubi. Nihče nima enega pregleda, katera jed že gre na mizo in katera še čaka.

Glass to pot avtomatizira od rezervacije mize do prinesene hrane. Gost rezervira mizo in pusti opombo. Rezervacija je takoj vidna natakarju. Naročilo, ki ga natakar odpre, samo preide v kuhinjo. Ko je jed pripravljena, natakar to vidi in jo odnese na mizo. Administrator ureja jedilnik, mize in račune osebja ter spremlja, kako ta pot teče čez dan.

## Ciljni uporabniki

Glass je namenjen lastnikom lokalov, ki strežejo goste za mizo in danes rezervacije, naročila ter zalogo vodijo z zvezkom, listkom in ustnim obvestilom.

**Lastnik restavracije.** Vodi manjšo restavracijo z mizami, jedilnikom in kuhinjo. Glass odpre, da vidi rezervacije, naročila, kaj je že na mizi in koliko je lokal v izbranem obdobju zaslužil oziroma nabavil.

**Lastnik kavarne.** Ima manj miz in več pijače kot jedi, strežba pa teče enako: gost sede, naroči, pijača pride iz bara, jed po potrebi iz kuhinje. Lastnik z Glassom vodi zasedenost miz, zalogo bara in dnevni obračun.

**Lastnik hotela.** V hotelu ima restavracijo ali zajtrkovalnico za hotelske goste in zunanje obiskovalce. Rezervacije miz se mešajo s prihodi gostov, ki nimajo rezervacije. Glass mu da en pregled od rezervacije do postrežene jedi in do obračuna lokala, ločeno od sob.

## Kratek opis delovanja

Koraki si sledijo sami: rezervacija pride do natakarja, naročilo do kuhinje, pripravljena jed pa nazaj do natakarja, ki jo odnese na mizo.

Gost izbere datum, uro, število oseb in mizo, ki je v tem terminu prosta. V opombo lahko zapiše alergijo ali da gre za rojstni dan. Rezervacija je potrjena. Ista miza v istem terminu ne more imeti druge potrjene rezervacije.

Natakar na seznamu vidi uro, številko mize, ime gosta in opombo. Ko gost pride, mizo označi kot zasedeno in odpre naročilo. V naročilo doda jedi iz jedilnika. Vsaka jed je najprej v statusu »čaka«.

V kuhinji se jed pojavi pri številki mize. Kuhar jo pripravi in status spremeni v »pripravljena«. Natakar to vidi na naročilu, jed odnese gostu in status spremeni v »postrežena«. Pri vsaki mizi je tako razvidno, kaj je že na mizi in kaj še ni.

Ko gostje končajo, natakar naročilo zaključi. Aplikacija sešteje cene postavk, shrani znesek in mizo spet označi kot prosto.

Gost lahko pride tudi brez rezervacije. Natakar takrat odpre samo naročilo, brez predhodne rezervacije.
