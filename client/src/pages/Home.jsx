import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { api } from "../api";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api
      .getProducts()
      .then((data) => {
        setProducts(data.products);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  const latestLot = products[0];

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="manifest-tag">
              <span>Torrefacteur independant</span>
              <span>Lots limites</span>
              <span>Expedition sous 48h</span>
            </div>
            <h1 className="h-display">Cafe d'origine, torrefie par lots.</h1>
            <p className="lede">
              Chaque sac porte un numero de lot, l'altitude de la parcelle et la date exacte de
              torrefaction. Pas de melange, pas d'anonymat: on achete directement aux cooperatives
              et on torrefie en petites quantites, chaque semaine.
            </p>
            <div className="hero-actions">
              <a href="#catalogue" className="btn">
                Voir le catalogue
              </a>
              <a href="#methode" className="btn btn-outline">
                Notre methode
              </a>
            </div>
          </div>

          {latestLot && (
            <div className="hero-ticket">
              <div className="eyebrow" style={{ marginBottom: 14 }}>
                Dernier lot recu
              </div>
              <div className="hero-ticket-row">
                <span className="label">Reference</span>
                <span className="value">{latestLot.lot_number}</span>
              </div>
              <div className="hero-ticket-row">
                <span className="label">Origine</span>
                <span className="value">
                  {latestLot.origin_country} — {latestLot.origin_farm}
                </span>
              </div>
              <div className="hero-ticket-row">
                <span className="label">Altitude</span>
                <span className="value">{latestLot.altitude_m} m</span>
              </div>
              <div className="hero-ticket-row">
                <span className="label">Procede</span>
                <span className="value">{latestLot.process}</span>
              </div>
              <div className="hero-ticket-row">
                <span className="label">Notes</span>
                <span className="value">{latestLot.tasting_notes}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section" id="catalogue">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Catalogue</div>
              <h2 className="h-display">Les lots disponibles</h2>
            </div>
          </div>

          {status === "loading" && <p>Chargement des lots...</p>}
          {status === "error" && (
            <p>Impossible de charger le catalogue pour le moment. Reessaie dans un instant.</p>
          )}
          {status === "ready" && products.length === 0 && (
            <p>Aucun lot disponible actuellement. Reviens bientot.</p>
          )}
          {status === "ready" && products.length > 0 && (
            <div className="grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" id="methode" style={{ borderTop: "1px solid var(--color-line)" }}>
        <div className="container">
          <div className="eyebrow">Notre methode</div>
          <h2 className="h-display" style={{ marginBottom: 20 }}>
            Trois principes, aucune exception.
          </h2>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
            <div>
              <div className="eyebrow">01</div>
              <p>
                <strong>Achat direct.</strong> On paie les cooperatives au-dessus du prix du
                marche, sans intermediaire.
              </p>
            </div>
            <div>
              <div className="eyebrow">02</div>
              <p>
                <strong>Petits lots.</strong> Chaque torrefaction correspond a une seule
                recolte, jamais un melange.
              </p>
            </div>
            <div>
              <div className="eyebrow">03</div>
              <p>
                <strong>Tracabilite totale.</strong> Numero de lot, altitude et date figurent
                sur chaque sac.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
