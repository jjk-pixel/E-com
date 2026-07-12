import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { useCart } from "../context/CartContext";
import { formatPrice, formatDate } from "../utils/format";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("loading");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setStatus("loading");
    api
      .getProduct(slug)
      .then((data) => {
        setProduct(data.product);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [slug]);

  if (status === "loading") {
    return <div className="container section">Chargement du lot...</div>;
  }

  if (status === "error" || !product) {
    return (
      <div className="container section empty-state">
        <span className="eyebrow">Introuvable</span>
        <p>Ce lot n'existe pas ou n'est plus disponible.</p>
        <Link to="/" className="btn">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  function handleAdd() {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="container product-detail">
      <div className="product-detail-image">
        <img src={product.image_url} alt={product.name} />
      </div>
      <div>
        <div className="eyebrow">{product.lot_number}</div>
        <h1 className="h-display" style={{ fontSize: 38, margin: "8px 0 6px" }}>
          {product.name}
        </h1>
        <p style={{ color: "var(--color-ink-soft)", marginBottom: 4 }}>{product.description}</p>

        <table className="spec-table">
          <tbody>
            <tr>
              <td>Origine</td>
              <td>{product.origin_country}</td>
            </tr>
            <tr>
              <td>Ferme / cooperative</td>
              <td>{product.origin_farm}</td>
            </tr>
            <tr>
              <td>Altitude</td>
              <td>{product.altitude_m} m</td>
            </tr>
            <tr>
              <td>Procede</td>
              <td>{product.process}</td>
            </tr>
            <tr>
              <td>Notes de degustation</td>
              <td>{product.tasting_notes}</td>
            </tr>
            <tr>
              <td>Torrefaction</td>
              <td>{formatDate(product.roast_date)}</td>
            </tr>
            <tr>
              <td>Stock</td>
              <td>{product.stock > 0 ? `${product.stock} sacs disponibles` : "Epuise"}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 600, margin: "18px 0" }}>
          {formatPrice(product.price_cents, product.currency)}
        </div>

        <div className="qty-row">
          <div className="qty-control">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Diminuer la quantite">
              −
            </button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => Math.min(20, q + 1))} aria-label="Augmenter la quantite">
              +
            </button>
          </div>
          <button className="btn" onClick={handleAdd} disabled={product.stock === 0}>
            {product.stock === 0 ? "Epuise" : added ? "Ajoute ✓" : "Ajouter au panier"}
          </button>
        </div>

        <button className="btn btn-outline" onClick={() => navigate("/cart")}>
          Voir le panier
        </button>
      </div>
    </div>
  );
}
