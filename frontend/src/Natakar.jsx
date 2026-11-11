import { useEffect, useState } from "react";
import { api } from "./api";

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

function cena(vrednost) {
  return `${Number(vrednost).toFixed(2).replace(".", ",")} €`;
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

  const miza = mize.find((stavka) => stavka.id === mizaId) || null;

  useEffect(() => {
    let preklicano = false;
    api(`/api/rezervacije/dan?datum=${datum}`)
      .then((data) => {
        if (!preklicano) {
          setVrstice(data);
          setNapaka("");
        }
      })
      .catch((err) => {
        if (!preklicano) {
          setVrstice([]);
          setNapaka(err.message);
        }
      });
    return () => {
      preklicano = true;
    };
  }, [datum]);

  useEffect(() => {
    let preklicano = false;
    Promise.all([
      api("/api/narocila/mize"),
      api("/api/narocila/jedilnik"),
      api("/api/zaloge/kuhinja"),
      api("/api/zaloge/bar"),
    ])
      .then(([mizeData, jediData, kuhinja, bar]) => {
        if (preklicano) return;
        setMize(mizeData);
        setJedi(sZalogo(jediData, kuhinja, bar));
      })
      .catch((err) => {
        if (!preklicano) setNarociloNapaka(err.message);
      });
    return () => {
      preklicano = true;
    };
  }, []);

  useEffect(() => {
    if (!miza?.narocilo_id) {
      setPostavke([]);
      return;
    }
    let preklicano = false;
    api(`/api/narocila/${miza.narocilo_id}/postavke`)
      .then((data) => {
        if (!preklicano) setPostavke(data);
      })
      .catch((err) => {
        if (!preklicano) setNarociloNapaka(err.message);
      });
    return () => {
      preklicano = true;
    };
  }, [miza?.narocilo_id]);

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
      setJedId(null);
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
      </header>

      <div className="natakar-stolpci">
        <section className="okvir rezervacije">
          <h2>Rezervacije</h2>
          {vrstice.map((vrstica) => (
            <article
              key={`${vrstica.ura}-${vrstica.stevilka_mize}-${vrstica.ime}-${vrstica.priimek}`}
              className="rezervacija-vrstica"
            >
              <strong>
                {vrstica.ura} · Miza {vrstica.stevilka_mize}
              </strong>
              <div>
                {vrstica.ime} {vrstica.priimek}
              </div>
              <div>Opomba: {vrstica.opomba}</div>
            </article>
          ))}
          {napaka && <p className="napaka">{napaka}</p>}
          <p className="tiho">Odpovedane rezervacije niso na seznamu.</p>
        </section>

        <section className="okvir">
          <h2>Mize</h2>
          <div className="mize">
            {mize.map((stavka) => {
              const lahko = stavka.status === "zasedena" || stavka.narocilo_id;
              return (
                <button
                  key={stavka.id}
                  type="button"
                  className={stavka.id === mizaId ? "miza izbrana" : "miza"}
                  disabled={!lahko}
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
          {!miza && <p className="tiho">Izberite zasedeno mizo.</p>}
          {miza && !miza.narocilo_id && (
            <button className="rezerviraj" type="button" onClick={odpri}>
              Odpri naročilo
            </button>
          )}
          {miza?.narocilo_id && (
            <>
              {postavke.map((postavka) => (
                <p key={postavka.id}>
                  {postavka.naziv} · {postavka.kolicina} · {postavka.status} · {cena(postavka.cena)}
                </p>
              ))}
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
            </>
          )}
          {narociloNapaka && <p className="napaka">{narociloNapaka}</p>}
        </section>
      </div>
    </main>
  );
}
