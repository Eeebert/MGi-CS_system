const path = require("path");
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const crypto = require("crypto");
const security = require("./security");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;
const schemaMode = String(
  process.env.DB_SCHEMA_MODE || (process.env.NODE_ENV === "production" ? "validate" : "apply")
)
  .trim()
  .toLowerCase();

// ====================
// SECURITY MIDDLEWARE
// ====================

// 1. SECURITY HEADERS
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // XSS Protection
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Feature Policy / Permissions Policy
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  // Content Security Policy
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
  next();
});

// 2. STRICT CORS - Only allow same origin or specific trusted origins
const configuredOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = configuredOrigins.length > 0
  ? configuredOrigins
  : [
      "http://localhost:5500",
      "http://localhost:3000",
      "http://127.0.0.1:5500",
      "http://127.0.0.1:3000",
      "https://mgi-cs-system.onrender.com",
    ];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked CORS request from: ${origin}`);
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  maxAge: 600,
}));

// 3. REQUEST SIZE LIMIT
app.use(express.json({ 
  limit: "100kb",
  strict: true,
}));

app.use(express.urlencoded({ 
  limit: "100kb",
  extended: false,
}));

// 4. REQUEST ID TRACKING & LOGGING
app.use((req, res, next) => {
  req.id = req.headers["x-request-id"] || crypto.randomUUID();
  req.timestamp = Date.now();
  console.log(`[${req.id}] ${req.method} ${req.path} - IP: ${req.ip || req.connection.remoteAddress}`);
  next();
});

// 5. INPUT VALIDATION MIDDLEWARE
const validateInputMiddleware = (req, res, next) => {
  // Validate request body size
  if (req.body && JSON.stringify(req.body).length > 100 * 1024) {
    return res.status(413).json({ error: "Payload too large" });
  }
  
  // Validate ID parameter format
  if (req.params.id && (typeof req.params.id !== "string" || req.params.id.length > 255)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  
  next();
};

app.use(validateInputMiddleware);

// 6. RATE LIMITING (in-memory, simple implementation)
const requestCounts = new Map();
const RATE_LIMIT = 100; // requests per window
const WINDOW_SIZE = 60000; // 1 minute

app.use((req, res, next) => {
  const key = `${req.ip}-${req.path}`;
  const now = Date.now();
  
  if (!requestCounts.has(key)) {
    requestCounts.set(key, []);
  }
  
  const timestamps = requestCounts.get(key).filter(t => now - t < WINDOW_SIZE);
  
  if (timestamps.length >= RATE_LIMIT) {
    console.warn(`Rate limit exceeded for: ${key}`);
    return res.status(429).json({ error: "Too many requests, please try again later" });
  }
  
  timestamps.push(now);
  requestCounts.set(key, timestamps);
  next();
});

// 7. ERROR HANDLING WRAPPER
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error(`[${req.id}] Error:`, error.message);
    res.status(500).json({ 
      error: "Internal server error",
      requestId: req.id,
      // Only include details in development
      ...(process.env.NODE_ENV === "development" && { detail: error.message }),
    });
  });
};

// ====================
// DATABASE SETUP
// ====================

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
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  
  pool.on("error", (err) => {
    console.error("Unexpected database pool error:", err.message);
  });
} else {
  console.warn("Database is not configured. Set SUPABASE_DB_URL (recommended) or DATABASE_URL.");
}

// ====================
// AUDIT LOGGING
// ====================

async function logAuditTrail(action, details = {}) {
  if (!pool) return;
  
  try {
    await pool.query(
      `INSERT INTO audit_logs (action, details, created_at) 
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT DO NOTHING`,
      [action, JSON.stringify(details)]
    );
  } catch (error) {
    console.error("Audit log error:", error.message);
    // Don't throw - logging errors shouldn't break the app
  }
}

// ====================
// DATABASE SCHEMA
// ====================

async function ensureSchema() {
  if (!pool) return;

  const MAX_RETRIES = 5;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Main data table with encryption support
      await pool.query(`
        CREATE TABLE IF NOT EXISTS app_state (
          id TEXT PRIMARY KEY,
          payload JSONB NOT NULL,
          pii_encrypted BOOLEAN DEFAULT FALSE,
          checksum TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_by TEXT,
          version INTEGER DEFAULT 1
        );
        
        CREATE INDEX IF NOT EXISTS idx_app_state_updated ON app_state(updated_at DESC);
      `);

      // Backward-compatible migration for databases created by older server versions.
      await pool.query(`
        ALTER TABLE app_state
        ADD COLUMN IF NOT EXISTS pii_encrypted BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS checksum TEXT,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_by TEXT,
        ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
      `);

      await pool.query(`
        UPDATE app_state
        SET created_at = NOW()
        WHERE created_at IS NULL;
      `);

      await pool.query(`
        UPDATE app_state
        SET version = 1
        WHERE version IS NULL;
      `);
      
      // Audit trail table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id SERIAL PRIMARY KEY,
          action TEXT NOT NULL,
          details JSONB,
          ip_address TEXT,
          user_agent TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      `);
      
      // Data integrity table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS data_backup (
          id SERIAL PRIMARY KEY,
          backup_data JSONB NOT NULL,
          backup_hash TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          created_by TEXT
        );
      `);

      // Enforce RLS on all public tables so Supabase REST access is blocked by default.
      await pool.query(`
        ALTER TABLE IF EXISTS public.app_state ENABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
        ALTER TABLE IF EXISTS public.data_backup ENABLE ROW LEVEL SECURITY;
      `);

      await pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public' AND tablename = 'app_state' AND policyname = 'deny_all_app_state'
          ) THEN
            CREATE POLICY deny_all_app_state
              ON public.app_state
              FOR ALL
              TO anon, authenticated
              USING (false)
              WITH CHECK (false);
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'deny_all_audit_logs'
          ) THEN
            CREATE POLICY deny_all_audit_logs
              ON public.audit_logs
              FOR ALL
              TO anon, authenticated
              USING (false)
              WITH CHECK (false);
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public' AND tablename = 'data_backup' AND policyname = 'deny_all_data_backup'
          ) THEN
            CREATE POLICY deny_all_data_backup
              ON public.data_backup
              FOR ALL
              TO anon, authenticated
              USING (false)
              WITH CHECK (false);
          END IF;
        END
        $$;
      `);
      
      console.log("Database schema ensured successfully");
      return;
    } catch (error) {
      console.error(`Schema setup attempt ${attempt}/${MAX_RETRIES} failed:`, error.message);
      if (attempt === MAX_RETRIES) throw error;
      await new Promise((resolve) => setTimeout(resolve, 3000 * attempt));
    }
  }
}

async function validateSchema() {
  if (!pool) {
    return { ok: false, missingTables: [] };
  }

  const requiredTables = ["app_state", "audit_logs", "data_backup"];
  const result = await pool.query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = ANY($1::text[])`,
    [requiredTables]
  );

  const existingTables = new Set(result.rows.map((row) => row.table_name));
  const missingTables = requiredTables.filter((tableName) => !existingTables.has(tableName));

  return {
    ok: missingTables.length === 0,
    missingTables,
  };
}

async function getRlsStatusSnapshot() {
  if (!pool) {
    return { enabled: false, tables: [], policies: [] };
  }

  const tablesToCheck = ["app_state", "audit_logs", "data_backup"];

  const tableResult = await pool.query(
    `SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
     FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relkind = 'r'
       AND n.nspname = 'public'
       AND c.relname = ANY($1::text[])
     ORDER BY c.relname`,
    [tablesToCheck]
  );

  const policyResult = await pool.query(
    `SELECT tablename, policyname, roles, cmd
     FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = ANY($1::text[])
     ORDER BY tablename, policyname`,
    [tablesToCheck]
  );

  const tableRows = tableResult.rows;
  const missingTables = tablesToCheck.filter(
    (tableName) => !tableRows.some((row) => row.table_name === tableName)
  );

  return {
    enabled: missingTables.length === 0 && tableRows.every((row) => row.rls_enabled === true),
    tables: [...tableRows, ...missingTables.map((tableName) => ({ table_name: tableName, rls_enabled: false }))],
    policies: policyResult.rows,
  };
}

// ====================
// API ENDPOINTS
// ====================

// Health check
app.get("/health", asyncHandler(async (req, res) => {
  const db = {
    connected: false,
    provider: databaseProvider,
    configured: Boolean(databaseUrl),
    schemaMode,
    rls: { enabled: false, tables: [], policies: [] },
  };

  if (pool) {
    try {
      await pool.query("SELECT 1");
      db.connected = true;

      try {
        db.rls = await getRlsStatusSnapshot();
      } catch (error) {
        db.rls = {
          enabled: false,
          tables: [],
          policies: [],
          error: error.message,
        };
      }
    } catch (error) {
      db.connected = false;
    }
  }

  res.json({ ok: true, db, requestId: req.id });
}));

// Get state
app.get("/api/state/:id", asyncHandler(async (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: "Database is not configured" });
  }

  const id = security.sanitizeString(req.params.id);
  
  try {
    const result = await pool.query(
      "SELECT payload, checksum FROM app_state WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.json({ payload: [] });
    }

    const row = result.rows[0];
    let payload = row.payload;
    
    if (!Array.isArray(payload)) {
      payload = [];
    }

    res.json({ 
      payload,
      checksum: row.checksum,
    });
  } catch (error) {
    console.error(`[${req.id}] GET /api/state error:`, error.message);
    res.status(500).json({ error: "Database query failed" });
  }
}));

// Update state with validation
app.put("/api/state/:id", asyncHandler(async (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: "Database is not configured" });
  }

  const id = security.sanitizeString(req.params.id);
  const payload = req.body?.payload;

  if (typeof payload === "undefined") {
    return res.status(400).json({ error: "payload is required" });
  }

  // Validate payload structure
  if (!Array.isArray(payload)) {
    return res.status(400).json({ error: "payload must be an array" });
  }

  try {
    const payloadJson = JSON.stringify(payload);
    
    // Generate checksum for integrity verification
    const checksum = security.generateHmac(payloadJson, process.env.SECRET_KEY || "default-secret");
    
    await pool.query(
      `INSERT INTO app_state (id, payload, checksum, version)
       VALUES ($1, $2::jsonb, $3, 1)
       ON CONFLICT (id)
       DO UPDATE SET payload = EXCLUDED.payload, checksum = $3, 
                     updated_at = NOW(), version = app_state.version + 1`,
      [id, payloadJson, checksum]
    );

    // Log audit trail
    await logAuditTrail("UPDATE_STATE", { 
      id, 
      recordCount: payload.length,
      ip: req.ip,
    });

    res.json({ ok: true, checksum });
  } catch (error) {
    console.error(`[${req.id}] PUT /api/state error:`, error.message);
    await logAuditTrail("UPDATE_STATE_ERROR", { 
      id, 
      error: error.message,
      ip: req.ip,
    });
    res.status(500).json({ error: "Database update failed" });
  }
}));

// Export backup
app.get("/api/backup/export", asyncHandler(async (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: "Database is not configured" });
  }

  try {
    const result = await pool.query(
      "SELECT id, payload, updated_at, checksum FROM app_state ORDER BY id ASC"
    );

    const backup = {
      exportedAt: new Date().toISOString(),
      totalKeys: result.rowCount,
      backupHash: security.generateHmac(JSON.stringify(result.rows), process.env.SECRET_KEY || "default-secret"),
      rows: result.rows.map((row) => ({
        id: row.id,
        payload: row.payload,
        updatedAt: row.updated_at,
        checksum: row.checksum,
      })),
    };

    // Save backup record
    await pool.query(
      "INSERT INTO data_backup (backup_data, backup_hash, created_by) VALUES ($1::jsonb, $2, $3)",
      [JSON.stringify(backup), backup.backupHash, "system"]
    );

    await logAuditTrail("BACKUP_EXPORT", { 
      totalKeys: result.rowCount,
      ip: req.ip,
    });

    res.json(backup);
  } catch (error) {
    console.error(`[${req.id}] GET /api/backup/export error:`, error.message);
    res.status(500).json({ error: "Backup export failed" });
  }
}));

// Import backup with validation
app.post("/api/backup/import", asyncHandler(async (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: "Database is not configured" });
  }

  const rows = req.body?.rows;
  const backupHash = req.body?.backupHash;
  const replace = req.body?.replace !== false;

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: "rows array is required" });
  }

  // Validate all rows
  for (const row of rows) {
    if (!row || typeof row.id !== "string" || row.id.trim() === "") {
      return res.status(400).json({ error: "Each row must have a non-empty string id" });
    }
    if (typeof row.payload === "undefined") {
      return res.status(400).json({ error: "Each row must include payload" });
    }
  }

  // Verify backup integrity if hash provided
  if (backupHash) {
    const computedHash = security.generateHmac(JSON.stringify(rows), process.env.SECRET_KEY || "default-secret");
    if (computedHash !== backupHash) {
      console.warn(`[${req.id}] Backup hash mismatch - possible data tampering`);
      await logAuditTrail("BACKUP_IMPORT_HASH_FAIL", { 
        rowCount: rows.length,
        ip: req.ip,
      });
      return res.status(400).json({ error: "Backup integrity check failed" });
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const ids = rows.map((row) => row.id.trim());
    if (replace) {
      await client.query("DELETE FROM app_state WHERE id <> ALL($1::text[])", [ids]);
    }

    for (const row of rows) {
      const payloadJson = JSON.stringify(row.payload ?? null);
      const checksum = security.generateHmac(payloadJson, process.env.SECRET_KEY || "default-secret");
      
      await client.query(
        `INSERT INTO app_state (id, payload, checksum, version)
         VALUES ($1, $2::jsonb, $3, 1)
         ON CONFLICT (id)
         DO UPDATE SET payload = EXCLUDED.payload, checksum = $3,
                       updated_at = NOW(), version = app_state.version + 1`,
        [row.id.trim(), payloadJson, checksum]
      );
    }

    await client.query("COMMIT");
    
    await logAuditTrail("BACKUP_IMPORT", { 
      importedRows: rows.length,
      replace,
      ip: req.ip,
    });

    res.json({ ok: true, imported: rows.length, replace });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`[${req.id}] POST /api/backup/import error:`, error.message);
    await logAuditTrail("BACKUP_IMPORT_ERROR", { 
      error: error.message,
      ip: req.ip,
    });
    res.status(500).json({ error: "Backup import failed" });
  } finally {
    client.release();
  }
}));

// Static files
app.use(express.static(__dirname));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ====================
// SERVER STARTUP
// ====================

(async () => {
  if (pool) {
    if (schemaMode === "apply") {
      try {
        await ensureSchema();
      } catch (error) {
        console.error("Schema setup failed after retries:", error.message);
      }
    } else {
      try {
        const schemaValidation = await validateSchema();
        if (!schemaValidation.ok) {
          console.error(
            `Database schema validation failed. Missing tables: ${schemaValidation.missingTables.join(", ")}`
          );
        } else {
          console.log("Database schema validation passed.");
        }
      } catch (error) {
        console.error("Schema validation failed:", error.message);
      }
    }
  }
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Database: ${databaseProvider}`);
    console.log(`Database schema mode: ${schemaMode}`);
    console.log(`Node environment: ${process.env.NODE_ENV || "production"}`);
  });
})();

module.exports = app;
