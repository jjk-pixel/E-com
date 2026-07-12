import { Link } from "react-router-dom";

export default function CheckoutCancel() {
  return (
    <div className="container empty-state">
      <span className="eyebrow">Paiement annule</span>
      <p>Ton panier est toujours disponible, rien n'a ete debite.</p>
      <div style={{ marginTop: 20, display: "flex", gap: 12, justifyContent: "center" }}>
        <Link to="/cart" className="btn">
          Retour au panier
        </Link>
        <Link to="/" className="btn btn-outline">
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}
