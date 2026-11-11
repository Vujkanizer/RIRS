import { useEffect, useState } from "react";
import { api } from "./api";

const URE = Array.from({ length: 16 }, (_, i) => String(8 + i).padStart(2, "0"));
const MINUTE = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

function vDelovnemCasu(ura) {
  const [ure, minute] = ura.split(":").map(Number);
  if (!Number.isInteger(ure) || !Number.isInteger(minute)) return false;
  const zacetek = ure * 60 + minute;
  return zacetek >= 8 * 60 && zacetek < 24 * 60;
}

function sedezi(stevilo) {
  if (stevilo % 100 === 1) return `${stevilo} sedež`;
  if (stevilo % 100 === 2) return `${stevilo} sedeža`;
  if (stevilo % 100 === 3 || stevilo % 100 === 4) return `${stevilo} sedeži`;
  return `${stevilo} sedežev`;
}

export default function Rezervacija() {
  const [datum, setDatum] = useState("");
  const [uraUre, setUraUre] = useState("");
  const [uraMinute, setUraMinute] = useState("");
  const ura = uraUre && uraMinute ? `${uraUre}:${uraMinute}` : "";
  const [steviloOseb, setSteviloOseb] = useState("");
  const [mize, setMize] = useState([]);
  const [mizaId, setMizaId] = useState(null);
  const [opomba, setOpomba] = useState("");
  const [potrditev, setPotrditev] = useState(false);
  const [shranjujem, setShranjujem] = useState(false);
  const [napaka, setNapaka] = useState("");
  const [jedi, setJedi] = useState([]);

  function prikaziMize(data) {
    setMize(data);
    setMizaId((trenutna) => {
      const izbrana = data.find((miza) => miza.id === trenutna);
      return izbrana?.prosta ? trenutna : null;
    });
  }

  useEffect(() => {
    let preklicano = false;
    api("/api/jedilnik")
      .then((data) => {
        if (!preklicano) setJedi(data);
      })
      .catch(() => {
        if (!preklicano) setJedi([]);
      });
    return () => {
      preklicano = true;
    };
  }, []);

  useEffect(() => {
    if (!datum || !ura) {
      setMize([]);
      setMizaId(null);
      return;
    }
    if (!vDelovnemCasu(ura)) {
      setMize([]);
      setMizaId(null);
      setNapaka("Restavracija je odprta od 8. do 23. ure.");
      return;
    }
    setNapaka("");
    let preklicano = false;
    const zacetek = encodeURIComponent(`${datum}T${ura}:00`);
    api(`/api/rezervacije/mize?zacetek=${zacetek}`)
      .then((data) => {
        if (!preklicano) prikaziMize(data);
      })
      .catch((err) => {
        if (!preklicano) {
          setMize([]);
          setNapaka(err.message);
        }
      });
    return () => {
      preklicano = true;
    };
  }, [datum, ura]);

  const izbrana = mize.find((miza) => miza.id === mizaId);

  function odpriPotrditev(event) {
    event.preventDefault();
    setNapaka("");
    const osebe = Number(steviloOseb);
    if (!datum || !ura || !Number.isInteger(osebe) || osebe < 1 || !izbrana) {
      setNapaka("Vnesite datum, uro, število oseb in mizo.");
      return;
    }
    if (!vDelovnemCasu(ura)) {
      setNapaka("Restavracija je odprta od 8. do 23. ure.");
      return;
    }
    setPotrditev(true);
  }

  async function potrdi() {
    setShranjujem(true);
    setNapaka("");
    try {
      await api("/api/rezervacije", {
        method: "POST",
        body: JSON.stringify({
          zacetek: `${datum}T${ura}:00`,
          miza_id: mizaId,
          stevilo_oseb: Number(steviloOseb),
          opomba,
        }),
      });
      setPotrditev(false);
      setOpomba("");
      setMizaId(null);
      window.location.hash = "#moje";
    } catch (err) {
      setPotrditev(false);
      setNapaka(err.message);
    } finally {
      setShranjujem(false);
    }
  }

  return (
    <form className="stran" onSubmit={odpriPotrditev}>
      <header className="okvir glava">
        <h1>
          <span className="znak">Glass</span> — Rezervacija mize
        </h1>
      </header>

      <section className="okvir">
        <div className="polja">
          <label>
            Datum
            <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} />
          </label>
          <label>
            Ura
            <span className="ura-izbira">
              <select value={uraUre} onChange={(e) => setUraUre(e.target.value)} aria-label="Ura">
                <option value="">—</option>
                {URE.map((vrednost) => (
                  <option key={vrednost} value={vrednost}>
                    {Number(vrednost)}
                  </option>
                ))}
              </select>
              <span className="ura-locilo">:</span>
              <select value={uraMinute} onChange={(e) => setUraMinute(e.target.value)} aria-label="Minute">
                <option value="">—</option>
                {MINUTE.map((vrednost) => (
                  <option key={vrednost} value={vrednost}>
                    {vrednost}
                  </option>
                ))}
              </select>
            </span>
          </label>
          <label>
            Število oseb
            <input
              type="number"
              min="1"
              value={steviloOseb}
              onChange={(e) => setSteviloOseb(e.target.value)}
            />
          </label>
        </div>
        <p className="opomba-vrstica">
          Restavracija je odprta od 8. do 23. ure. Miza ostane zasedena, dokler natakar rezervacije ne zaključi.
        </p>
      </section>

      <div className="stolpci">
        <section className="okvir">
          <h2>Mize</h2>
          <div className="mize">
            {mize.map((miza) => (
              <button
                key={miza.id}
                type="button"
                className={miza.id === mizaId ? "miza izbrana" : "miza"}
                disabled={!miza.prosta}
                onClick={() => setMizaId(miza.id)}
              >
                <span>Miza {miza.stevilka}</span>
                <span className="stanje">{miza.prosta ? "prosta" : "zasedena"}</span>
              </button>
            ))}
          </div>
          <p>
            Izbrana:{" "}
            {izbrana ? `Miza ${izbrana.stevilka}, ${sedezi(izbrana.stevilo_sedezev)}` : "—"}
          </p>
          <label>
            Opomba
            <textarea value={opomba} onChange={(e) => setOpomba(e.target.value)} rows={4} />
          </label>
        </section>

        <div>
          <section className="okvir jedilnik">
            <h2>Jedilnik</h2>
            {[
              ["predjed", "Predjed"],
              ["glavna_jed", "Glavna jed"],
              ["sladica", "Sladica"],
              ["pijaca", "Pijača"],
            ].map(([kljuc, naslov]) => {
              const skupina = jedi.filter((jed) => jed.kategorija === kljuc);
              if (skupina.length === 0) return null;
              return (
                <div key={kljuc}>
                  <h3>{naslov}</h3>
                  {skupina.map((jed) => (
                    <p key={jed.id}>
                      {jed.naziv} · {Number(jed.cena).toFixed(2).replace(".", ",")} €
                    </p>
                  ))}
                </div>
              );
            })}
          </section>
          <button className="rezerviraj" type="submit">
            Rezerviraj
          </button>
        </div>
      </div>

      {napaka && <p className="napaka">{napaka}</p>}
      <p className="tiho">Če je miza v terminu že potrjena, se rezervacija ne shrani.</p>

      {potrditev && izbrana && (
        <div className="zavesa">
          <div className="pogovor" role="dialog" aria-modal="true" aria-labelledby="potrditev-naslov">
            <h2 id="potrditev-naslov">Preverite rezervacijo</h2>
            <p>Miza {izbrana.stevilka}</p>
            <p>
              {datum.split("-").reverse().join(". ")} ob {ura}
            </p>
            <p>Število oseb: {steviloOseb}</p>
            <p>Opomba: {opomba.trim() || "—"}</p>
            <div className="pogovor-gumbi">
              <button type="button" className="drugotni" onClick={() => setPotrditev(false)} disabled={shranjujem}>
                Prekliči
              </button>
              <button type="button" className="status-gumb" onClick={potrdi} disabled={shranjujem}>
                Potrdi
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
