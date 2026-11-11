import { useEffect, useState } from "react";
import { api } from "./api";
import Odjava from "./Odjava";

const KATEGORIJE = [
  ["predjed", "Predjed"],
  ["glavna_jed", "Glavna jed"],
  ["sladica", "Sladica"],
  ["pijaca", "Pijača"],
];

function danes() {
  const datum = new Date();
  const mesec = String(datum.getMonth() + 1).padStart(2, "0");
  const dan = String(datum.getDate()).padStart(2, "0");
  return `${datum.getFullYear()}-${mesec}-${dan}`;
}

const STATUS = {
  caka: "čaka",
  pripravljena: "pripravljena",
  postrezena: "postrežena",
};

function cena(vrednost) {
  return `${Number(vrednost).toFixed(2).replace(".", ",")} €`;
}

function lahkoPostrezi(postavka) {
  if (postavka.status === "pripravljena") return true;
  return postavka.status === "caka" && postavka.hod == null && postavka.skladisce === "bar";
}

function znesekNarocila(postavke) {
  const vsota = postavke.reduce((sestevek, postavka) => sestevek + Number(postavka.cena) * postavka.kolicina, 0);
  return cena(vsota);
}

function skupineNaRacunu(postavke) {
  const skupine = new Map();
  for (const postavka of postavke) {
    const kljuc = `${postavka.jed_id}-${postavka.status}-${postavka.cena}`;
    const obstojeca = skupine.get(kljuc);
    if (obstojeca) {
      obstojeca.kolicina += postavka.kolicina;
      obstojeca.ids.push(postavka.id);
    } else {
      skupine.set(kljuc, { ...postavka, ids: [postavka.id] });
    }
  }
  return [...skupine.values()];
}

function sZalogo(jedi, kuhinja, bar) {
  const zaloga = new Map([...kuhinja, ...bar].map((artikel) => [artikel.id, artikel.zaloga]));
  return jedi.map((jed) => ({ ...jed, zaloga: zaloga.get(jed.id) ?? 0 }));
}

export default function Natakar() {
  const [datum, setDatum] = useState(danes);
  const [vrstice, setVrstice] = useState([]);
  const [mize, setMize] = useState([]);
  const [jedi, setJedi] = useState([]);
  const [mizaId, setMizaId] = useState(null);
  const [postavke, setPostavke] = useState([]);
  const [jedId, setJedId] = useState(null);
  const [napaka, setNapaka] = useState("");
  const [narociloNapaka, setNarociloNapaka] = useState("");
  const [potrdiRacun, setPotrdiRacun] = useState(false);
  const [zakljucujem, setZakljucujem] = useState(false);
  const [zaRezervacijo, setZaRezervacijo] = useState(null);
  const [zakljucujemRezervacijo, setZakljucujemRezervacijo] = useState(false);

  const miza = mize.find((stavka) => stavka.id === mizaId) || null;

  useEffect(() => {
    let preklicano = false;

    async function nalozi() {
      try {
        const data = await api(`/api/rezervacije/dan?datum=${datum}`);
        if (!preklicano) {
          setVrstice(data);
          setNapaka("");
        }
      } catch (err) {
        if (!preklicano) {
          setVrstice([]);
          setNapaka(err.message);
        }
      }
    }

    nalozi();
    const casovnik = setInterval(nalozi, 5000);
    return () => {
      preklicano = true;
      clearInterval(casovnik);
    };
  }, [datum]);

  useEffect(() => {
    let preklicano = false;

    async function nalozi() {
      try {
        const [mizeData, jediData, kuhinja, bar] = await Promise.all([
          api("/api/narocila/mize"),
          api("/api/narocila/jedilnik"),
          api("/api/zaloge/kuhinja"),
          api("/api/zaloge/bar"),
        ]);
        if (preklicano) return;
        setMize(mizeData);
        setJedi(sZalogo(jediData, kuhinja, bar));
      } catch (err) {
        if (!preklicano) setNarociloNapaka(err.message);
      }
    }

    nalozi();
    const casovnik = setInterval(nalozi, 5000);
    return () => {
      preklicano = true;
      clearInterval(casovnik);
    };
  }, []);

  useEffect(() => {
    if (!miza?.narocilo_id) {
      setPostavke([]);
      return;
    }
    const narociloId = miza.narocilo_id;
    let preklicano = false;

    async function nalozi() {
      try {
        const data = await api(`/api/narocila/${narociloId}/postavke`);
        if (!preklicano) setPostavke(data);
      } catch (err) {
        if (!preklicano) setNarociloNapaka(err.message);
      }
    }

    nalozi();
    const casovnik = setInterval(nalozi, 5000);
    return () => {
      preklicano = true;
      clearInterval(casovnik);
    };
  }, [miza?.narocilo_id]);

  async function zakljuciRezervacijo() {
    if (!zaRezervacijo) return;
    setNapaka("");
    setZakljucujemRezervacijo(true);
    try {
      await api(`/api/rezervacije/${zaRezervacijo.id}/zakljucek`, { method: "POST" });
      setZaRezervacijo(null);
      setVrstice(await api(`/api/rezervacije/dan?datum=${datum}`));
    } catch (err) {
      setZaRezervacijo(null);
      setNapaka(err.message);
    } finally {
      setZakljucujemRezervacijo(false);
    }
  }

  async function zasedi() {
    setNarociloNapaka("");
    try {
      await api(`/api/narocila/mize/${miza.id}/zasedi`, { method: "POST" });
      setMize((stanje) =>
        stanje.map((stavka) => (stavka.id === miza.id ? { ...stavka, status: "zasedena" } : stavka)),
      );
    } catch (err) {
      setNarociloNapaka(err.message);
    }
  }

  async function odpri() {
    setNarociloNapaka("");
    try {
      const narocilo = await api("/api/narocila", {
        method: "POST",
        body: JSON.stringify({ miza_id: miza.id }),
      });
      setMize((stanje) =>
        stanje.map((stavka) =>
          stavka.id === miza.id ? { ...stavka, narocilo_id: narocilo.id } : stavka,
        ),
      );
    } catch (err) {
      setNarociloNapaka(err.message);
    }
  }

  async function postrezi(ids) {
    setNarociloNapaka("");
    try {
      for (const id of ids) {
        await api(`/api/narocila/${miza.narocilo_id}/postavke/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "postrezena" }),
        });
      }
      setPostavke(await api(`/api/narocila/${miza.narocilo_id}/postavke`));
    } catch (err) {
      setPostavke(await api(`/api/narocila/${miza.narocilo_id}/postavke`));
      setNarociloNapaka(err.message);
    }
  }

  async function odstrani(id) {
    setNarociloNapaka("");
    try {
      await api(`/api/narocila/${miza.narocilo_id}/postavke/${id}`, { method: "DELETE" });
      setPostavke(await api(`/api/narocila/${miza.narocilo_id}/postavke`));
    } catch (err) {
      setNarociloNapaka(err.message);
    }
  }

  async function zakljuci() {
    setNarociloNapaka("");
    setZakljucujem(true);
    try {
      await api(`/api/narocila/${miza.narocilo_id}/zakljucek`, { method: "POST" });
      setPotrdiRacun(false);
      setMize(await api("/api/narocila/mize"));
      setMizaId(null);
      setPostavke([]);
      setJedId(null);
    } catch (err) {
      setPotrdiRacun(false);
      setNarociloNapaka(err.message);
    } finally {
      setZakljucujem(false);
    }
  }

  async function dodaj() {
    setNarociloNapaka("");
    try {
      const izbrana = jedi.find((jed) => jed.id === jedId);
      if (!izbrana || izbrana.zaloga < 1) return;
      await api(`/api/narocila/${miza.narocilo_id}/postavke`, {
        method: "POST",
        body: JSON.stringify({ jed_id: jedId, kolicina: 1 }),
      });
      const [postavkeData, jediData, kuhinja, bar] = await Promise.all([
        api(`/api/narocila/${miza.narocilo_id}/postavke`),
        api("/api/narocila/jedilnik"),
        api("/api/zaloge/kuhinja"),
        api("/api/zaloge/bar"),
      ]);
      setPostavke(postavkeData);
      setJedi(sZalogo(jediData, kuhinja, bar));
    } catch (err) {
      setNarociloNapaka(err.message);
    }
  }

  return (
    <main className="stran natakar-stran">
      <header className="okvir glava natakar-glava">
        <h1>
          <span className="znak">Glass</span> — Natakar
        </h1>
        <label>
          Dan
          <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} />
        </label>
        {localStorage.getItem("vloga") !== "administrator" && <Odjava />}
      </header>

      <div className="natakar-stolpci">
        <section className="okvir rezervacije">
          <h2>Rezervacije</h2>
          {vrstice.map((vrstica) => (
            <article key={vrstica.id} className="rezervacija-vrstica">
              <strong>
                {vrstica.ura} · Miza {vrstica.stevilka_mize}
              </strong>
              <div>
                {vrstica.ime} {vrstica.priimek}
              </div>
              <div>Opomba: {vrstica.opomba}</div>
              <button type="button" className="status-gumb" onClick={() => setZaRezervacijo(vrstica)}>
                Zaključi
              </button>
            </article>
          ))}
          {napaka && <p className="napaka">{napaka}</p>}
          <p className="tiho">Zaključek sprosti mizo za novo rezervacijo.</p>
        </section>

        <section className="okvir">
          <h2>Mize</h2>
          <div className="mize">
            {mize.map((stavka) => {
              const zasedena = stavka.status !== "prosta" || Boolean(stavka.narocilo_id);
              const razred = ["miza", zasedena ? "zasedena" : "", stavka.id === mizaId ? "izbrana" : ""]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={stavka.id}
                  type="button"
                  className={razred}
                  onClick={() => setMizaId(stavka.id)}
                >
                  <span>Miza {stavka.stevilka}</span>
                  <span className="stanje">{stavka.narocilo_id ? "naročilo" : stavka.status}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="okvir">
          <h2>{miza ? `Naročilo · Miza ${miza.stevilka}` : "Naročilo"}</h2>
          {!miza && <p className="tiho">Izberite mizo.</p>}
          {miza && miza.status === "prosta" && !miza.narocilo_id && (
            <button className="rezerviraj" type="button" onClick={zasedi}>
              Zasedi mizo
            </button>
          )}
          {miza && miza.status !== "prosta" && !miza.narocilo_id && (
            <button className="rezerviraj" type="button" onClick={odpri}>
              Odpri naročilo
            </button>
          )}
          {miza?.narocilo_id && (
            <>
              <div className="racun">
                {skupineNaRacunu(postavke).map((postavka) => (
                  <div key={postavka.ids.join("-")} className="kuhinja-jed">
                    <div>
                      <strong>{postavka.naziv}</strong>
                      <div className="tiho">
                        {STATUS[postavka.status] || postavka.status} · {postavka.kolicina} × {cena(postavka.cena)}
                      </div>
                    </div>
                    <div className="vrstica-gumbi">
                      <button
                        type="button"
                        className="drugotni"
                        onClick={() => odstrani(postavka.ids[postavka.ids.length - 1])}
                      >
                        Obriši
                      </button>
                      {lahkoPostrezi(postavka) && (
                        <button type="button" className="status-gumb" onClick={() => postrezi(postavka.ids)}>
                          Postrežena
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {KATEGORIJE.map(([kljuc, naslov]) => {
                const skupina = jedi.filter((jed) => jed.kategorija === kljuc);
                if (skupina.length === 0) return null;
                return (
                  <div key={kljuc}>
                    <h3>{naslov}</h3>
                    {skupina.map((jed) => {
                      const prazno = jed.zaloga < 1;
                      return (
                        <button
                          key={jed.id}
                          type="button"
                          className={jed.id === jedId ? "meni-jed izbrana" : "meni-jed"}
                          disabled={prazno}
                          onClick={() => setJedId(jed.id)}
                        >
                          <span>{jed.naziv}</span>
                          <span>{prazno ? "ni na voljo" : `${cena(jed.cena)} · ${jed.zaloga}`}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
              <button
                className="rezerviraj"
                type="button"
                disabled={!jedi.some((jed) => jed.id === jedId && jed.zaloga > 0)}
                onClick={dodaj}
              >
                Dodaj na naročilo
              </button>
              <p>Znesek: {znesekNarocila(postavke)}</p>
              <button className="rezerviraj" type="button" onClick={() => setPotrdiRacun(true)}>
                Zaključi račun
              </button>
            </>
          )}
          {narociloNapaka && <p className="napaka">{narociloNapaka}</p>}
        </section>
      </div>

      {zaRezervacijo && (
        <div className="zavesa">
          <div className="pogovor" role="dialog" aria-modal="true" aria-labelledby="rezervacija-naslov">
            <h2 id="rezervacija-naslov">Zaključek rezervacije</h2>
            <p>Ali res želite zaključiti rezervacijo?</p>
            <p>
              {zaRezervacijo.ura} · Miza {zaRezervacijo.stevilka_mize}
            </p>
            <p>
              {zaRezervacijo.ime} {zaRezervacijo.priimek}
            </p>
            <div className="pogovor-gumbi">
              <button
                type="button"
                className="drugotni"
                onClick={() => setZaRezervacijo(null)}
                disabled={zakljucujemRezervacijo}
              >
                Ne
              </button>
              <button type="button" className="status-gumb" onClick={zakljuciRezervacijo} disabled={zakljucujemRezervacijo}>
                Da
              </button>
            </div>
          </div>
        </div>
      )}

      {potrdiRacun && miza && (
        <div className="zavesa">
          <div className="pogovor" role="dialog" aria-modal="true" aria-labelledby="racun-naslov">
            <h2 id="racun-naslov">Zaključek računa</h2>
            <p>Ali res želite zaključiti račun za mizo {miza.stevilka}?</p>
            <p>Znesek: {znesekNarocila(postavke)}</p>
            <div className="pogovor-gumbi">
              <button type="button" className="drugotni" onClick={() => setPotrdiRacun(false)} disabled={zakljucujem}>
                Ne
              </button>
              <button type="button" className="status-gumb" onClick={zakljuci} disabled={zakljucujem}>
                Da
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
