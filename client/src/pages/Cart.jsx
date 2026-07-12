import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { formatPrice } from "../utils/format";

export default function Cart() {
  const { items, updateQuantity, removeItem, totalCents } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/cart" } } });
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
      const data = await api.checkout(payload, token);
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container empty-state">
        <span className="eyebrow">Panier</span>
        <p>Ton panier est vide pour le moment.</p>
        <Link to="/" className="btn">
          Voir le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="section-head">
        <div>
          <div className="eyebrow">Panier</div>
          <h2 className="h-display">Ton panier</h2>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 40 }}>
        <div>
          {items.map((item) => (
            <div className="cart-line" key={item.productId}>
              <img src={item.imageUrl} alt={item.name} />
              <div>
                <h4 className="cart-line-title">{item.name}</h4>
                <span className="cart-line-lot">{item.lotNumber}</span>
              </div>
              <div className="qty-control">
                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="price">{formatPrice(item.priceCents * item.quantity)}</div>
                <button
                  onClick={() => removeItem(item.productId)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-ink-soft)",
                    fontSize: 12,
                    cursor: "pointer",
                    marginTop: 6,
                    textDecoration: "underline",
                  }}
                >
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-row">
            <span>Sous-total</span>
            <span>{formatPrice(totalCents)}</span>
          </div>
          <div className="summary-row">
            <span>Livraison</span>
            <span>Calculee a l'etape suivante</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(totalCents)}</span>
          </div>

          {error && <div className="form-error" style={{ marginTop: 14 }}>{error}</div>}

          <button className="btn btn-block" style={{ marginTop: 16 }} onClick={handleCheckout} disabled={loading}>
            {loading ? "Redirection vers le paiement..." : "Payer avec Stripe"}
          </button>
          {!user && (
            <p style={{ fontSize: 12, color: "var(--color-ink-soft)", marginTop: 10 }}>
              Connexion requise pour finaliser la commande.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
