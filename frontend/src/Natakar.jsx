import { useEffect, useState } from "react";
import { api } from "./api";

function danes() {
  const datum = new Date();
  const mesec = String(datum.getMonth() + 1).padStart(2, "0");
  const dan = String(datum.getDate()).padStart(2, "0");
  return `${datum.getFullYear()}-${mesec}-${dan}`;
}

export default function Natakar() {
  const [datum, setDatum] = useState(danes);
  const [vrstice, setVrstice] = useState([]);
  const [napaka, setNapaka] = useState("");

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

  return (
    <main className="stran">
      <header className="okvir glava natakar-glava">
        <h1>
          <span className="znak">Glass</span> — Natakar
        </h1>
        <label>
          Dan
          <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} />
        </label>
      </header>

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
    </main>
  );
}
