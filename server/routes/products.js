const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    res.json({ products: rows });
  } catch (err) {
    console.error("[products/list]", err);
    res.status(500).json({ error: "Impossible de charger les lots." });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM products WHERE slug = $1", [
      req.params.slug,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Ce lot n'existe pas ou n'est plus disponible." });
    }
    res.json({ product: rows[0] });
  } catch (err) {
    console.error("[products/detail]", err);
    res.status(500).json({ error: "Impossible de charger ce lot." });
  }
});

module.exports = router;
