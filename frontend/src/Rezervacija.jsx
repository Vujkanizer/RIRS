import { useEffect, useState } from "react";
import { api } from "./api";

function sedezi(stevilo) {
  if (stevilo % 100 === 1) return `${stevilo} sedež`;
  if (stevilo % 100 === 2) return `${stevilo} sedeža`;
  if (stevilo % 100 === 3 || stevilo % 100 === 4) return `${stevilo} sedeži`;
  return `${stevilo} sedežev`;
}

export default function Rezervacija() {
  const [datum, setDatum] = useState("");
  const [ura, setUra] = useState("");
  const [steviloOseb, setSteviloOseb] = useState("");
  const [mize, setMize] = useState([]);
  const [mizaId, setMizaId] = useState(null);
  const [opomba, setOpomba] = useState("");
  const [sporocilo, setSporocilo] = useState("");
  const [napaka, setNapaka] = useState("");

  function prikaziMize(data) {
    setMize(data);
    setMizaId((trenutna) => {
      const izbrana = data.find((miza) => miza.id === trenutna);
      return izbrana?.prosta ? trenutna : null;
    });
  }

  useEffect(() => {
    if (!datum || !ura) {
      setMize([]);
      setMizaId(null);
      return;
    }
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

  async function shrani(event) {
    event.preventDefault();
    setSporocilo("");
    setNapaka("");
    const osebe = Number(steviloOseb);
    if (!datum || !ura || !Number.isInteger(osebe) || osebe < 1 || !mizaId) {
      setNapaka("Vnesite datum, uro, število oseb in mizo.");
      return;
    }
    try {
      await api("/api/rezervacije", {
        method: "POST",
        body: JSON.stringify({
          zacetek: `${datum}T${ura}:00`,
          miza_id: mizaId,
          stevilo_oseb: osebe,
          opomba,
        }),
      });
      setSporocilo("Rezervacija je shranjena.");
      setOpomba("");
      setMizaId(null);
      const zacetek = encodeURIComponent(`${datum}T${ura}:00`);
      prikaziMize(await api(`/api/rezervacije/mize?zacetek=${zacetek}`));
    } catch (err) {
      setNapaka(err.message);
    }
  }

  return (
    <form className="stran" onSubmit={shrani}>
      <header className="okvir glava">
        <h1><span className="znak">Glass</span> — Rezervacija mize</h1>
      </header>

      <section className="okvir">
        <div className="polja">
          <label>
            Datum
            <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} />
          </label>
          <label>
            Ura
            <input type="time" value={ura} onChange={(e) => setUra(e.target.value)} />
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
          Termin traja 120 minut. Zasedena miza v tem času ni na izbiro.
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
            <p className="tiho">Zaloga gostu ni vidna.</p>
          </section>
          <button className="rezerviraj" type="submit">
            Rezerviraj
          </button>
        </div>
      </div>

      {sporocilo && <p className="uspeh">{sporocilo}</p>}
      {napaka && <p className="napaka">{napaka}</p>}
      <p className="tiho">Če je miza v terminu že potrjena, se rezervacija ne shrani.</p>
    </form>
  );
}
