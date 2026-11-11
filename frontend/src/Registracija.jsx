import { useState } from "react";
import { api } from "./api";
import { shraniSejo } from "./seja";

export default function Registracija() {
  const [ime, setIme] = useState("");
  const [priimek, setPriimek] = useState("");
  const [email, setEmail] = useState("");
  const [geslo, setGeslo] = useState("");
  const [napaka, setNapaka] = useState("");

  async function shrani(event) {
    event.preventDefault();
    setNapaka("");
    try {
      const data = await api("/api/register", {
        method: "POST",
        body: JSON.stringify({ ime, priimek, email, geslo }),
      });
      shraniSejo(data);
    } catch (err) {
      setNapaka(err.message);
    }
  }

  return (
    <form className="stran seja-stran" onSubmit={shrani}>
      <section className="okvir glava seja-obrazec">
        <h1>
          <span className="znak">Glass</span> — Registracija
        </h1>
        <div className="seja-ime">
          <label>
            Ime
            <input value={ime} onChange={(e) => setIme(e.target.value)} />
          </label>
          <label>
            Priimek
            <input value={priimek} onChange={(e) => setPriimek(e.target.value)} />
          </label>
        </div>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Geslo
          <input type="password" value={geslo} onChange={(e) => setGeslo(e.target.value)} />
        </label>
        <button className="rezerviraj" type="submit">
          Registriraj se
        </button>
        {napaka && <p className="napaka">{napaka}</p>}
        <p className="tiho seja-povezava">
          Že imate račun? <a href="#prijava">Prijava</a>
        </p>
      </section>
    </form>
  );
}
