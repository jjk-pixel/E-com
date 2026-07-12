import { Link } from "react-router-dom";
import { formatPrice } from "../utils/format";

export default function ProductCard({ product }) {
  return (
    <Link to={`/produits/${product.slug}`} className="lot-card">
      <div className="lot-card-image">
        <span className="lot-card-number">{product.lot_number}</span>
        <img src={product.image_url} alt={product.name} loading="lazy" />
      </div>
      <div className="lot-card-body">
        <h3>{product.name}</h3>
        <div className="lot-card-meta">
          <span>{product.origin_country}</span>
          <span>{product.altitude_m}m</span>
          <span>{product.process}</span>
        </div>
        <p className="lot-card-notes">{product.tasting_notes}</p>
        <div className="lot-card-footer">
          <span className="price">{formatPrice(product.price_cents, product.currency)}</span>
          <span className="eyebrow">Voir le lot</span>
        </div>
      </div>
    </Link>
  );
}
