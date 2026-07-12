const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "[db] DATABASE_URL n'est pas definie. Configure une base PostgreSQL (voir .env.example)."
  );
}

const pool = new Pool({
  connectionString,
  // Render's managed Postgres requires SSL in production, but not for local dev.
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

pool.on("error", (err) => {
  console.error("[db] Erreur inattendue sur le pool PostgreSQL", err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
