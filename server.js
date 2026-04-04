const path = require("path");
const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

const databaseUrl = process.env.DATABASE_URL;

let pool = null;
if (databaseUrl) {
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

async function ensureSchema() {
  if (!pool) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      id TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

app.get("/health", async (_req, res) => {
  const db = { connected: false };

  if (pool) {
    try {
      await pool.query("SELECT 1");
      db.connected = true;
    } catch (error) {
      db.connected = false;
      db.error = error.message;
    }
  }

  res.json({ ok: true, db });
});

app.get("/api/state/:id", async (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: "Database is not configured" });
  }

  const id = req.params.id;
  const result = await pool.query("SELECT payload FROM app_state WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    return res.json({ payload: null });
  }

  return res.json({ payload: result.rows[0].payload });
});

app.put("/api/state/:id", async (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: "Database is not configured" });
  }

  const id = req.params.id;
  const payload = req.body?.payload;

  if (typeof payload === "undefined") {
    return res.status(400).json({ error: "payload is required" });
  }

  await pool.query(
    `
      INSERT INTO app_state (id, payload)
      VALUES ($1, $2)
      ON CONFLICT (id)
      DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
    `,
    [id, payload]
  );

  return res.json({ ok: true });
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

(async () => {
  try {
    await ensureSchema();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
})();
