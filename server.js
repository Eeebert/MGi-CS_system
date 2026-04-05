const path = require("path");
const express = require("express");
const { Pool } = require("pg");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json({ limit: "1mb" }));

// Prevent browsers from caching HTML, JS, and CSS so updates deploy immediately
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
  }

  if (/\.(html|js|css)$/.test(req.path)) {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
  }
  next();
});

app.use(express.static(__dirname));

const databaseUrl = (process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || "").trim() || null;
const databaseProvider = process.env.SUPABASE_DB_URL
  ? "supabase"
  : (process.env.DATABASE_URL ? "postgres" : "none");

let pool = null;
if (databaseUrl) {
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  pool.on("error", (err) => {
    console.error("Unexpected database pool error:", err.message);
  });
} else {
  console.warn("Database is not configured. Set SUPABASE_DB_URL (recommended) or DATABASE_URL.");
}

async function ensureSchema() {
  if (!pool) return;

  const MAX_RETRIES = 5;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS app_state (
          id TEXT PRIMARY KEY,
          payload JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      return;
    } catch (error) {
      console.error(`Schema setup attempt ${attempt}/${MAX_RETRIES} failed:`, error.message);
      if (attempt === MAX_RETRIES) throw error;
      await new Promise((resolve) => setTimeout(resolve, 3000 * attempt));
    }
  }
}

app.get("/health", async (_req, res) => {
  const db = { connected: false, provider: databaseProvider, configured: Boolean(databaseUrl) };

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

  try {
    const id = req.params.id;
    const result = await pool.query("SELECT payload FROM app_state WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.json({ payload: null });
    }

    return res.json({ payload: result.rows[0].payload });
  } catch (error) {
    console.error("GET /api/state error:", error.message);
    return res.status(500).json({ error: "Database query failed" });
  }
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

  try {
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
  } catch (error) {
    console.error("PUT /api/state error:", error.message);
    return res.status(500).json({ error: "Database query failed" });
  }
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

(async () => {
  try {
    await ensureSchema();
  } catch (error) {
    console.error("Schema setup failed after retries, continuing without schema:", error.message);
  }
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
