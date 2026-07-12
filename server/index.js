require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");

const { runMigrations } = require("./migrate");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const stripeWebhookRoutes = require("./routes/stripeWebhook");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// Le webhook Stripe a besoin du corps brut pour verifier la signature.
// Cette route doit donc etre montee AVANT express.json().
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhookRoutes);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// En production, le build React (client/dist) est servi directement par ce serveur.
const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(clientDist, "index.html"));
});

async function start() {
  try {
    await runMigrations();
  } catch (err) {
    console.error("[startup] Echec des migrations de base de donnees:", err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[server] Meridien API demarree sur le port ${PORT}`);
  });
}

start();
