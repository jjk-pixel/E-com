const express = require("express");
const Stripe = require("stripe");
const db = require("../db");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

// IMPORTANT: cette route doit recevoir le corps brut (raw), pas du JSON parse,
// pour que la verification de signature Stripe fonctionne. Voir index.js ou
// express.raw() est applique uniquement a ce chemin, avant express.json().
router.post("/", async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      // Pas de secret configure (dev local sans Stripe CLI): on fait confiance au payload.
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error("[stripe/webhook] Signature invalide:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    try {
      await recordOrder(session);
    } catch (err) {
      console.error("[stripe/webhook] Echec enregistrement commande:", err);
      return res.status(500).send("Erreur d'enregistrement de la commande.");
    }
  }

  res.json({ received: true });
});

async function recordOrder(session) {
  const existing = await db.query(
    "SELECT id FROM orders WHERE stripe_session_id = $1",
    [session.id]
  );
  if (existing.rows.length > 0) return; // deja enregistree (idempotence)

  const userId = Number(session.metadata?.userId);
  const cart = JSON.parse(session.metadata?.cart || "[]");
  if (!userId || cart.length === 0) return;

  const productIds = cart.map((i) => i.productId);
  const { rows: products } = await db.query(
    "SELECT * FROM products WHERE id = ANY($1::int[])",
    [productIds]
  );

  const shippingDetails = session.customer_details || {};

  const { rows: orderRows } = await db.query(
    `INSERT INTO orders (user_id, stripe_session_id, status, total_cents, currency, shipping_name, shipping_address)
     VALUES ($1, $2, 'paid', $3, $4, $5, $6)
     RETURNING id`,
    [
      userId,
      session.id,
      session.amount_total,
      session.currency,
      shippingDetails.name || null,
      session.shipping_details ? JSON.stringify(session.shipping_details.address) : null,
    ]
  );
  const orderId = orderRows[0].id;

  for (const item of cart) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    await db.query(
      `INSERT INTO order_items (order_id, product_id, product_name, lot_number, unit_price_cents, quantity)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [orderId, product.id, product.name, product.lot_number, product.price_cents, item.quantity]
    );
    await db.query(
      "UPDATE products SET stock = GREATEST(stock - $1, 0) WHERE id = $2",
      [item.quantity, product.id]
    );
  }
}

module.exports = router;
