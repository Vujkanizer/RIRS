import { useEffect, useState } from "react";
import Admin from "./Admin";
import Kuhinja from "./Kuhinja";
import MojeRezervacije from "./MojeRezervacije";
import Natakar from "./Natakar";
import Prijava from "./Prijava";
import Racuni from "./Racuni";
import Registracija from "./Registracija";
import Rezervacija from "./Rezervacija";
import { odjavi } from "./seja";

const DOMOV = {
  gost: "#rezervacija",
  natakar: "#natakar",
  kuhar: "#kuhinja",
  administrator: "#admin",
};

const DOVOLJENO = {
  gost: ["#rezervacija", "#moje"],
  natakar: ["#natakar"],
  kuhar: ["#kuhinja"],
  administrator: ["#admin", "#racuni", "#natakar", "#kuhinja"],
};

const POVEZAVE = [
  ["#admin", "Osebje"],
  ["#racuni", "Računi"],
  ["#natakar", "Natakar"],
  ["#kuhinja", "Kuhinja"],
];


const GOST_POVEZAVE = [
  ["#rezervacija", "Rezervacija"],
  ["#moje", "Moje rezervacije"],
];

function preberiSejo() {
  return {
    token: localStorage.getItem("token"),
    vloga: localStorage.getItem("vloga"),
  };
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash);
  const [seja, setSeja] = useState(preberiSejo);

  useEffect(() => {
    const spremeni = () => {
      setHash(window.location.hash);
      setSeja(preberiSejo());
    };
    window.addEventListener("hashchange", spremeni);
    window.addEventListener("glass-seja", spremeni);
    return () => {
      window.removeEventListener("hashchange", spremeni);
      window.removeEventListener("glass-seja", spremeni);
    };
  }, []);

  const dovoljeno = DOVOLJENO[seja.vloga] || [];
  const trenutni = dovoljeno.includes(hash) ? hash : DOMOV[seja.vloga] || "";

  useEffect(() => {
    if (seja.token && trenutni !== hash) window.location.hash = trenutni;
  }, [seja.token, trenutni, hash]);

  if (!seja.token) {
    if (hash === "#registracija") return <Registracija />;
    return <Prijava />;
  }

  let zaslon = <Rezervacija />;
  if (trenutni === "#moje") zaslon = <MojeRezervacije />;
  if (trenutni === "#natakar") zaslon = <Natakar />;
  if (trenutni === "#kuhinja") zaslon = <Kuhinja />;
  if (trenutni === "#admin") zaslon = <Admin />;
  if (trenutni === "#racuni") zaslon = <Racuni />;


  return (
    <>
      {seja.vloga === "gost" && (
        <div className="stran seja-vrh">
          <div className="okvir glava natakar-glava">
            <nav className="povezave">
              {GOST_POVEZAVE.map(([povezava, naziv]) => (
                <a key={povezava} href={povezava}>
                  {naziv}
                </a>
              ))}
            </nav>
            <button type="button" className="odjava" onClick={odjavi}>
              Odjava
            </button>
          </div>
        </div>
      )}
      {seja.vloga === "administrator" && (
        <div className="stran seja-vrh">
          <div className="okvir glava natakar-glava">
            <nav className="povezave">
              {POVEZAVE.map(([povezava, naziv]) => (
                <a key={povezava} href={povezava}>
                  {naziv}
                </a>
              ))}
            </nav>
            <button type="button" className="odjava" onClick={odjavi}>
              Odjava
            </button>
          </div>
        </div>
      )}
      {zaslon}
    </>
  );
}
