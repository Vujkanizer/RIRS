import { useEffect, useState } from "react";
import { api } from "./api";
import Odjava from "./Odjava";

const STATUS = {
  caka: "čaka",
  pripravljena: "pripravljena",
  postrezena: "postrežena",
};

export default function Kuhinja() {
  const [mize, setMize] = useState(null);
  const [jedi, setJedi] = useState([]);
  const [napaka, setNapaka] = useState("");

  useEffect(() => {
    let preklicano = false;

    async function nalozi() {
      try {
        const data = await api("/api/kuhinja");
        if (!preklicano) {
          setMize(data);
          setNapaka("");
        }
      } catch (err) {
        if (!preklicano) setNapaka(err.message);
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
    let preklicano = false;

    async function nalozi() {
      try {
        const data = await api("/api/zaloge/kuhinja");
        if (!preklicano) setJedi(data);
      } catch (err) {
        if (!preklicano) setNapaka(err.message);
      }
    }

    nalozi();
    const casovnik = setInterval(nalozi, 5000);
    return () => {
      preklicano = true;
      clearInterval(casovnik);
    };
  }, []);

  async function pripravi(skupina, jed) {
    setNapaka("");
    try {
      await api(`/api/narocila/${skupina.narocilo_id}/postavke/${jed.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "pripravljena" }),
      });
      setMize(await api("/api/kuhinja"));
    } catch (err) {
      setNapaka(err.message);
    }
  }

  return (
    <main className="stran natakar-stran">
      <header className="okvir glava natakar-glava">
        <h1>
          <span className="znak">Glass</span> — Kuhinja
        </h1>
        {localStorage.getItem("vloga") !== "administrator" && <Odjava />}
      </header>

      <div className="kuhinja-stolpci">
        <section className="okvir">
          {mize?.map((skupina) => (
            <article key={skupina.narocilo_id} className="kuhinja-miza">
              <h2>
                Miza {skupina.stevilka_mize} · hod {skupina.hod}
              </h2>
              {skupina.jedi.map((jed) => (
                <div key={jed.id} className="kuhinja-jed">
                  <div>
                    <strong>{jed.naziv}</strong>
                    <div className="tiho">status: {STATUS[jed.status] || jed.status}</div>
                  </div>
                  {jed.status === "caka" && (
                    <button type="button" className="status-gumb" onClick={() => pripravi(skupina, jed)}>
                      Pripravljena
                    </button>
                  )}
                </div>
              ))}
            </article>
          ))}
          {mize?.length === 0 && <p className="tiho">Ni odprtih jedi.</p>}
          {napaka && <p className="napaka">{napaka}</p>}
        </section>

        <section className="okvir">
          <h2>Zaloga kuhinje</h2>
          {jedi.map((jed) => (
            <p key={jed.id} className={jed.zaloga === 0 ? "tiho" : undefined}>
              {jed.naziv} · {jed.zaloga}
              {jed.zaloga === 0 ? " · ni na voljo" : ""}
            </p>
          ))}
          {jedi.length === 0 && !napaka && <p className="tiho">V kuhinji ni artiklov.</p>}
         </section>
      </div>
    </main>
  );
}
