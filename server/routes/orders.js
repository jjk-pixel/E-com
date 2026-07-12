const express = require("express");
const Stripe = require("stripe");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

// Cree une session Stripe Checkout a partir du panier envoye par le client.
// Le panier n'est jamais fait confiance pour les prix: on relit toujours
// le prix courant en base a partir des product_id fournis.
router.post("/checkout", requireAuth, async (req, res) => {
  try {
    const { items } = req.body; // [{ productId, quantity }]

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Le panier est vide." });
    }

    const productIds = items.map((i) => i.productId);
    const { rows: products } = await db.query(
      "SELECT * FROM products WHERE id = ANY($1::int[])",
      [productIds]
    );

    if (products.length !== new Set(productIds).size) {
      return res.status(400).json({ error: "Un ou plusieurs articles du panier sont introuvables." });
    }

    const lineItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const quantity = Math.max(1, Math.min(20, Number(item.quantity) || 1));
      return {
        price_data: {
          currency: product.currency,
          product_data: {
            name: `${product.name} - ${product.lot_number}`,
            description: `${product.origin_country} - ${product.process} - ${product.altitude_m}m`,
          },
          unit_amount: product.price_cents,
        },
        quantity,
      };
    });

    const clientUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get("host")}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: req.user.email,
      shipping_address_collection: { allowed_countries: ["FR", "BE", "CH", "TG", "US", "CA"] },
      success_url: `${clientUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/checkout/cancel`,
      metadata: {
        userId: String(req.user.id),
        cart: JSON.stringify(
          items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
        ),
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("[orders/checkout]", err);
    res.status(500).json({ error: "La creation du paiement a echoue. Reessaie dans un instant." });
  }
});

// Historique des commandes de l'utilisateur connecte
router.get("/", requireAuth, async (req, res) => {
  try {
    const { rows: orders } = await db.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );

    const orderIds = orders.map((o) => o.id);
    let itemsByOrder = {};
    if (orderIds.length > 0) {
      const { rows: items } = await db.query(
        "SELECT * FROM order_items WHERE order_id = ANY($1::int[])",
        [orderIds]
      );
      itemsByOrder = items.reduce((acc, item) => {
        acc[item.order_id] = acc[item.order_id] || [];
        acc[item.order_id].push(item);
        return acc;
      }, {});
    }

    const result = orders.map((o) => ({
      ...o,
      items: itemsByOrder[o.id] || [],
    }));

    res.json({ orders: result });
  } catch (err) {
    console.error("[orders/list]", err);
    res.status(500).json({ error: "Impossible de charger l'historique des commandes." });
  }
});

// Verifie une session apres redirection Stripe (utile en fallback du webhook,
// notamment en developpement local ou le webhook n'est pas toujours joignable).
router.get("/session/:sessionId", requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM orders WHERE stripe_session_id = $1 AND user_id = $2",
      [req.params.sessionId, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(202).json({ status: "pending" });
    }
    res.json({ order: rows[0] });
  } catch (err) {
    console.error("[orders/session]", err);
    res.status(500).json({ error: "Impossible de verifier cette commande." });
  }
});

module.exports = router;
