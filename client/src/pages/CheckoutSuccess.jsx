import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { api } from "../api";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { token } = useAuth();
  const { clearCart } = useCart();
  const [status, setStatus] = useState("checking"); // checking | confirmed | timeout

  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sessionId || !token) return;

    let attempts = 0;
    let cancelled = false;

    async function poll() {
      attempts += 1;
      try {
        const data = await api.getOrderBySession(sessionId, token);
        if (cancelled) return;
        if (data.order) {
          setStatus("confirmed");
          return;
        }
      } catch {
        // on continue de retenter
      }
      if (attempts < 8) {
        setTimeout(poll, 1500);
      } else if (!cancelled) {
        setStatus("timeout");
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId, token]);

  return (
    <div className="container empty-state">
      <span className="eyebrow">Paiement</span>
      {status === "checking" && <p>Confirmation du paiement en cours...</p>}
      {status === "confirmed" && (
        <>
          <h2 className="h-display" style={{ margin: "10px 0 16px" }}>
            Merci, ta commande est confirmee.
          </h2>
          <p>Un recapitulatif est disponible dans ton historique de commandes.</p>
        </>
      )}
      {status === "timeout" && (
        <>
          <h2 className="h-display" style={{ margin: "10px 0 16px" }}>
            Paiement recu, confirmation en cours.
          </h2>
          <p>Ta commande apparaitra dans ton historique dans quelques instants.</p>
        </>
      )}
      <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
        <Link to="/orders" className="btn">
          Voir mes commandes
        </Link>
        <Link to="/" className="btn btn-outline">
          Retour au catalogue
        </Link>
      </div>
    </div>
  );
}
