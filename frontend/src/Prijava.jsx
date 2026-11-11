import { useState } from "react";
import { api } from "./api";
import { shraniSejo } from "./seja";

export default function Prijava() {
  const [email, setEmail] = useState("");
  const [geslo, setGeslo] = useState("");
  const [napaka, setNapaka] = useState("");

  async function prijavi(event) {
    event.preventDefault();
    setNapaka("");
    try {
      const data = await api("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, geslo }),
      });
      shraniSejo(data);
    } catch (err) {
      setNapaka(err.message);
    }
  }

  return (
    <form className="stran seja-stran" onSubmit={prijavi}>
      <section className="okvir glava seja-obrazec">
        <h1>
          <span className="znak">Glass</span> — Prijava
        </h1>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Geslo
          <input type="password" value={geslo} onChange={(e) => setGeslo(e.target.value)} />
        </label>
        <button className="rezerviraj" type="submit">
          Prijavi se
        </button>
        {napaka && <p className="napaka">{napaka}</p>}
        <p className="tiho seja-povezava">
          Gost še nima računa? <a href="#registracija">Registracija</a>
        </p>
      </section>
    </form>
  );
}
