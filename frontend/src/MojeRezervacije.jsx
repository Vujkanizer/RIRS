import { useEffect, useState } from "react";
import { api } from "./api";

const STATUS = {
  potrjena: "potrjena",
  odpovedana: "odpovedana",
  gost_prisel: "gost je prišel",
  zakljucena: "zaključena",
};

function prikaziZacetek(iso) {
  const cas = new Date(iso);
  const dan = String(cas.getUTCDate()).padStart(2, "0");
  const mesec = String(cas.getUTCMonth() + 1).padStart(2, "0");
  const ura = String(cas.getUTCHours()).padStart(2, "0");
  const minuta = String(cas.getUTCMinutes()).padStart(2, "0");
  return `${dan}. ${mesec}. ${cas.getUTCFullYear()}, ${ura}:${minuta}`;
}

function osebe(stevilo) {
  if (stevilo % 100 === 1) return `${stevilo} oseba`;
  if (stevilo % 100 === 2) return `${stevilo} osebi`;
  if (stevilo % 100 === 3 || stevilo % 100 === 4) return `${stevilo} osebe`;
  return `${stevilo} oseb`;
}

function Vrstica({ rezervacija, onOdpovej }) {
  return (
    <article className="rezervacija-vrstica">
      <strong>
        Miza {rezervacija.stevilka_mize} · {prikaziZacetek(rezervacija.zacetek)}
      </strong>
      <p>
        {osebe(rezervacija.stevilo_oseb)} · {STATUS[rezervacija.status] || rezervacija.status}
      </p>
      {rezervacija.opomba && <p>Opomba: {rezervacija.opomba}</p>}
      {onOdpovej && (
        <button type="button" className="drugotni" onClick={() => onOdpovej(rezervacija)}>
          Odpovej
        </button>
      )}
    </article>
  );
}

export default function MojeRezervacije() {
  const [rezervacije, setRezervacije] = useState(null);
  const [napaka, setNapaka] = useState("");
  const [zaOdpoved, setZaOdpoved] = useState(null);
  const [odpovedujem, setOdpovedujem] = useState(false);

  useEffect(() => {
    let preklicano = false;
    api("/api/rezervacije")
      .then((data) => {
        if (!preklicano) setRezervacije(data);
      })
      .catch((err) => {
        if (!preklicano) {
          setRezervacije([]);
          setNapaka(err.message);
        }
      });
    return () => {
      preklicano = true;
    };
  }, []);

  async function potrdiOdpoved() {
    if (!zaOdpoved) return;
    setNapaka("");
    setOdpovedujem(true);
    try {
      await api(`/api/rezervacije/${zaOdpoved.id}/odpoved`, { method: "POST" });
      setZaOdpoved(null);
      setRezervacije(await api("/api/rezervacije"));
    } catch (err) {
      setZaOdpoved(null);
      setNapaka(err.message);
    } finally {
      setOdpovedujem(false);
    }
  }

  const seznam = rezervacije || [];
  const prihajajoce = seznam
    .filter((rezervacija) => rezervacija.status === "potrjena")
    .sort((a, b) => new Date(a.zacetek) - new Date(b.zacetek));
  const zgodovina = seznam
    .filter((rezervacija) => rezervacija.status !== "potrjena")
    .sort((a, b) => new Date(b.zacetek) - new Date(a.zacetek));

  return (
    <div className="stran">
      <header className="okvir glava">
        <h1>
          <span className="znak">Glass</span> — Moje rezervacije
        </h1>
      </header>

      {napaka && <p className="napaka">{napaka}</p>}

      <section className="okvir">
        <h2>Prihajajoče</h2>
        {rezervacije === null && <p className="tiho">Nalagam.</p>}
        {rezervacije !== null && prihajajoce.length === 0 && (
          <p className="tiho">Nimate prihajajočih rezervacij.</p>
        )}
        {prihajajoce.map((rezervacija) => (
          <Vrstica
            key={rezervacija.id}
            rezervacija={rezervacija}
            onOdpovej={setZaOdpoved}
          />
        ))}
      </section>

      <section className="okvir">
        <h2>Zgodovina</h2>
        {rezervacije !== null && zgodovina.length === 0 && (
          <p className="tiho">Zgodovina je prazna.</p>
        )}
        {zgodovina.map((rezervacija) => (
          <Vrstica key={rezervacija.id} rezervacija={rezervacija} />
        ))}
      </section>

      {zaOdpoved && (
        <div className="zavesa">
          <div className="pogovor" role="dialog" aria-modal="true" aria-labelledby="odpoved-naslov">
            <h2 id="odpoved-naslov">Odpoved rezervacije</h2>
            <p>Ali res želite odpovedati rezervacijo?</p>
            <p>
              Miza {zaOdpoved.stevilka_mize} · {prikaziZacetek(zaOdpoved.zacetek)}
            </p>
            <div className="pogovor-gumbi">
              <button type="button" className="drugotni" onClick={() => setZaOdpoved(null)} disabled={odpovedujem}>
                Ne
              </button>
              <button type="button" className="status-gumb" onClick={potrdiOdpoved} disabled={odpovedujem}>
                Da
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
