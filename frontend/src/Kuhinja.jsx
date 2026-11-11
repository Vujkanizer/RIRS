import { useEffect, useState } from "react";
import { api } from "./api";

export default function Kuhinja() {
  const [jedi, setJedi] = useState([]);
  const [napaka, setNapaka] = useState("");

  useEffect(() => {
    let preklicano = false;
    api("/api/zaloge/kuhinja")
      .then((data) => {
        if (!preklicano) {
          setJedi(data);
          setNapaka("");
        }
      })
      .catch((err) => {
        if (!preklicano) {
          setJedi([]);
          setNapaka(err.message);
        }
      });
    return () => {
      preklicano = true;
    };
  }, []);

  return (
    <main className="stran">
      <header className="okvir glava">
        <h1>
          <span className="znak">Glass</span> — Kuhinja
        </h1>
      </header>
      <section className="okvir">
        <h2>Zaloga</h2>
        {jedi.map((jed) => (
          <p key={jed.id} className={jed.zaloga === 0 ? "tiho" : undefined}>
            {jed.naziv} · {jed.zaloga}
            {jed.zaloga === 0 ? " · ni na voljo" : ""}
          </p>
        ))}
        {jedi.length === 0 && !napaka && <p className="tiho">V kuhinji ni artiklov.</p>}
        {napaka && <p className="napaka">{napaka}</p>}
      </section>
    </main>
  );
}
