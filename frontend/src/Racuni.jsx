import { useEffect, useState } from "react";
import { api } from "./api";

function cena(vrednost) {
  return `${Number(vrednost).toFixed(2).replace(".", ",")} €`;
}

function prikaziCas(iso) {
  const cas = new Date(iso);
  const dan = String(cas.getDate()).padStart(2, "0");
  const mesec = String(cas.getMonth() + 1).padStart(2, "0");
  const ura = String(cas.getHours()).padStart(2, "0");
  const minuta = String(cas.getMinutes()).padStart(2, "0");
  return `${dan}. ${mesec}. ${cas.getFullYear()}, ${ura}:${minuta}`;
}

export default function Racuni() {
  const [racuni, setRacuni] = useState(null);
  const [napaka, setNapaka] = useState("");

  useEffect(() => {
    let preklicano = false;
    api("/api/racuni")
      .then((data) => {
        if (!preklicano) setRacuni(data);
      })
      .catch((err) => {
        if (!preklicano) {
          setRacuni([]);
          setNapaka(err.message);
        }
      });
    return () => {
      preklicano = true;
    };
  }, []);

  return (
    <div className="stran">
      <header className="okvir glava">
        <h1>
          <span className="znak">Glass</span> — Računi
        </h1>
      </header>

      <section className="okvir">
        {racuni === null && <p className="tiho">Nalagam.</p>}
        {racuni !== null && racuni.length === 0 && !napaka && <p className="tiho">Ni računov.</p>}
        {racuni?.map((racun) => (
          <article key={racun.id} className="racun-vrstica">
            <div className="racun-glava">
              <strong>
                Miza {racun.stevilka_mize} · {prikaziCas(racun.cas)}
              </strong>
              <span>{cena(racun.znesek)}</span>
            </div>
            <div className="tiho">Natakar: {racun.natakar}</div>
            <ul className="racun-postavke">
              {racun.postavke.map((postavka) => (
                <li key={`${postavka.naziv}-${postavka.cena}`}>
                  {postavka.naziv} · {postavka.kolicina} × {cena(postavka.cena)}
                </li>
              ))}
            </ul>
          </article>
        ))}
        {napaka && <p className="napaka">{napaka}</p>}
      </section>
    </div>
  );
}
