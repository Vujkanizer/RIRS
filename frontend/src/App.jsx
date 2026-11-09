import { useEffect, useState } from "react";
import Natakar from "./Natakar";
import Rezervacija from "./Rezervacija";

export default function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const spremeni = () => setHash(window.location.hash);
    window.addEventListener("hashchange", spremeni);
    return () => window.removeEventListener("hashchange", spremeni);
  }, []);

  if (hash === "#natakar") return <Natakar />;
  return <Rezervacija />;
}
