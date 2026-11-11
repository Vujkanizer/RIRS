import { useEffect, useState } from "react";
import { api } from "./api";

const VLOGA = {
  natakar: "Natakar",
  kuhar: "Kuhar",
};

export default function Admin() {
  const [ime, setIme] = useState("");
  const [priimek, setPriimek] = useState("");
  const [email, setEmail] = useState("");
  const [geslo, setGeslo] = useState("");
  const [vloga, setVloga] = useState("natakar");
  const [osebje, setOsebje] = useState(null);
  const [urejanje, setUrejanje] = useState(null);
  const [zaIzbris, setZaIzbris] = useState(null);
  const [potrdiUstvari, setPotrdiUstvari] = useState(false);
  const [brisem, setBrisem] = useState(false);
  const [shranjujem, setShranjujem] = useState(false);
  const [sporocilo, setSporocilo] = useState("");
  const [napaka, setNapaka] = useState("");

  function nalozi() {
    return api("/api/uporabniki").then(setOsebje);
  }

  useEffect(() => {
    let preklicano = false;
    api("/api/uporabniki")
      .then((data) => {
        if (!preklicano) setOsebje(data);
      })
      .catch((err) => {
        if (!preklicano) {
          setOsebje([]);
          setNapaka(err.message);
        }
      });
    return () => {
      preklicano = true;
    };
  }, []);

  function pocisti() {
    setUrejanje(null);
    setIme("");
    setPriimek("");
    setEmail("");
    setGeslo("");
    setVloga("natakar");
  }

  function uredi(oseba) {
    setUrejanje(oseba.id);
    setIme(oseba.ime);
    setPriimek(oseba.priimek);
    setEmail(oseba.email);
    setGeslo("");
    setVloga(oseba.vloga);
    setSporocilo("");
    setNapaka("");
  }

  async function shrani(event) {
    event.preventDefault();
    setSporocilo("");
    setNapaka("");
    if (!urejanje) {
      setPotrdiUstvari(true);
      return;
    }
    try {
      const telo = { ime, priimek, email, vloga };
      if (geslo) telo.geslo = geslo;
      await api(`/api/uporabniki/${urejanje}`, {
        method: "PATCH",
        body: JSON.stringify(telo),
      });
      setSporocilo("Račun je shranjen.");
      pocisti();
      await nalozi();
    } catch (err) {
      setNapaka(err.message);
    }
  }

  async function ustvari() {
    setNapaka("");
    setShranjujem(true);
    try {
      await api("/api/uporabniki", {
        method: "POST",
        body: JSON.stringify({ ime, priimek, email, geslo, vloga }),
      });
      setPotrdiUstvari(false);
      setSporocilo("Račun je ustvarjen.");
      pocisti();
      await nalozi();
    } catch (err) {
      setPotrdiUstvari(false);
      setNapaka(err.message);
    } finally {
      setShranjujem(false);
    }
  }

  async function izbrisi() {
    if (!zaIzbris) return;
    setNapaka("");
    setBrisem(true);
    try {
      await api(`/api/uporabniki/${zaIzbris.id}`, { method: "DELETE" });
      if (urejanje === zaIzbris.id) pocisti();
      setZaIzbris(null);
      setSporocilo("Račun je izbrisan.");
      await nalozi();
    } catch (err) {
      setZaIzbris(null);
      setNapaka(err.message);
    } finally {
      setBrisem(false);
    }
  }

  return (
    <div className="stran">
      <header className="okvir glava">
        <h1>
          <span className="znak">Glass</span> — Osebje
        </h1>
      </header>

      <div className="admin-stolpci">
        <section className="okvir">
          <h2>Seznam</h2>
          {osebje === null && <p className="tiho">Nalagam.</p>}
          {osebje !== null && osebje.length === 0 && <p className="tiho">Ni osebja.</p>}
          {osebje?.map((oseba) => (
            <article key={oseba.id} className="oseba-vrstica">
              <div>
                <strong>
                  {oseba.ime} {oseba.priimek}
                </strong>
                <div className="tiho">
                  {VLOGA[oseba.vloga] || oseba.vloga} · {oseba.email}
                </div>
              </div>
              <div className="vrstica-gumbi">
                <button type="button" className="drugotni" onClick={() => uredi(oseba)}>
                  Uredi
                </button>
                <button type="button" className="drugotni" onClick={() => setZaIzbris(oseba)}>
                  Izbriši
                </button>
              </div>
            </article>
          ))}
        </section>

        <form className="okvir admin-obrazec" onSubmit={shrani}>
          <h2>{urejanje ? "Uredi račun" : "Novo osebje"}</h2>
          <div className="admin-polja">
            <label>
              Ime
              <input value={ime} onChange={(e) => setIme(e.target.value)} />
            </label>
            <label>
              Priimek
              <input value={priimek} onChange={(e) => setPriimek(e.target.value)} />
            </label>
            <label className="admin-geslo">
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              Vloga
              <select value={vloga} onChange={(e) => setVloga(e.target.value)}>
                <option value="natakar">Natakar</option>
                <option value="kuhar">Kuhar</option>
              </select>
            </label>
            <label>
              Geslo
              <input type="password" value={geslo} onChange={(e) => setGeslo(e.target.value)} />
            </label>
          </div>
          {urejanje && <p className="tiho">Geslo pustite prazno, če ga ne menjate.</p>}
          <div className="admin-gumbi">
            <button className="rezerviraj" type="submit">
              {urejanje ? "Shrani spremembe" : "Ustvari račun"}
            </button>
            {urejanje && (
              <button type="button" className="drugotni" onClick={pocisti}>
                Prekliči
              </button>
            )}
          </div>
          {sporocilo && <p className="uspeh">{sporocilo}</p>}
          {napaka && <p className="napaka">{napaka}</p>}
        </form>
      </div>

      {potrdiUstvari && (
        <div className="zavesa">
          <div className="pogovor" role="dialog" aria-modal="true" aria-labelledby="ustvari-naslov">
            <h2 id="ustvari-naslov">Nov račun</h2>
            <p>Ali res želite ustvariti račun?</p>
            <p>
              {ime} {priimek}
            </p>
            <p>
              {VLOGA[vloga] || vloga} · {email}
            </p>
            <div className="pogovor-gumbi">
              <button
                type="button"
                className="drugotni"
                onClick={() => setPotrdiUstvari(false)}
                disabled={shranjujem}
              >
                Ne
              </button>
              <button type="button" className="status-gumb" onClick={ustvari} disabled={shranjujem}>
                Da
              </button>
            </div>
          </div>
        </div>
      )}

      {zaIzbris && (
        <div className="zavesa">
          <div className="pogovor" role="dialog" aria-modal="true" aria-labelledby="izbris-naslov">
            <h2 id="izbris-naslov">Izbris računa</h2>
            <p>Ali res želite izbrisati račun?</p>
            <p>
              {zaIzbris.ime} {zaIzbris.priimek}
            </p>
            <div className="pogovor-gumbi">
              <button type="button" className="drugotni" onClick={() => setZaIzbris(null)} disabled={brisem}>
                Ne
              </button>
              <button type="button" className="status-gumb" onClick={izbrisi} disabled={brisem}>
                Da
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
