import { useEffect, useState } from "react";
import Kuhinja from "./Kuhinja";
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
  if (hash === "#kuhinja") return <Kuhinja />;
  return <Rezervacija />;
}
