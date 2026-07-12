import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { formatPrice, formatDate } from "../utils/format";

const STATUS_LABELS = {
  paid: "Payee",
  pending: "En attente",
};

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api
      .getOrders(token)
      .then((data) => {
        setOrders(data.orders);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  if (status === "loading") {
    return <div className="container section">Chargement de l'historique...</div>;
  }

  if (status === "error") {
    return <div className="container section">Impossible de charger tes commandes.</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="container empty-state">
        <span className="eyebrow">Historique</span>
        <p>Tu n'as pas encore passe de commande.</p>
        <Link to="/" className="btn">
          Voir le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="eyebrow">Historique</div>
      <h2 className="h-display" style={{ marginBottom: 26 }}>
        Mes commandes
      </h2>

      {orders.map((order) => (
        <div className="order-card" key={order.id}>
          <div className="order-card-head">
            <span>Commande #{order.id}</span>
            <span>{formatDate(order.created_at)}</span>
            <span className="status-pill">{STATUS_LABELS[order.status] || order.status}</span>
          </div>
          {order.items.map((item) => (
            <div className="order-item-row" key={item.id}>
              <span>
                {item.product_name} <span style={{ color: "var(--color-ink-soft)" }}>({item.lot_number})</span> ×{" "}
                {item.quantity}
              </span>
              <span>{formatPrice(item.unit_price_cents * item.quantity, order.currency)}</span>
            </div>
          ))}
          <div className="summary-row total" style={{ marginTop: 10 }}>
            <span>Total</span>
            <span>{formatPrice(order.total_cents, order.currency)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
