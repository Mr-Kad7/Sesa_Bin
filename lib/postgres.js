const fs = require("fs");
const path = require("path");

try {
  require("dotenv").config({ path: path.join(process.cwd(), ".env.local"), quiet: true });
  require("dotenv").config({ path: path.join(process.cwd(), ".env"), quiet: true });
} catch (err) {
  // Next.js loads env files itself; dotenv is only needed for direct Node runs.
}

let activeDb = null;
let initPromise = null;

const POSTGRES_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pickups (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  waste_type TEXT NOT NULL,
  quantity TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_notifications (
  id SERIAL PRIMARY KEY,
  pickup_id INTEGER REFERENCES pickups(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reward_redemptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reward_name TEXT NOT NULL,
  points_spent INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now();
ALTER TABLE pickups ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE pickups ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE pickups ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_pickups_created_at ON pickups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user_id ON reward_redemptions(user_id);
`;

const SQLITE_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pickups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  name TEXT NOT NULL,
  waste_type TEXT NOT NULL,
  quantity TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS admin_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pickup_id INTEGER,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pickup_id) REFERENCES pickups(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reward_redemptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  reward_name TEXT NOT NULL,
  points_spent INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_pickups_created_at ON pickups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user_id ON reward_redemptions(user_id);
`;

function isPrismaDevUrl(url) {
  return typeof url === "string" && url.startsWith("prisma+postgres://");
}

function postgresConfig() {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString && !isPrismaDevUrl(connectionString)) {
    const config = { connectionString };
    if (connectionString.includes("sslmode=require")) {
      config.ssl = { rejectUnauthorized: false };
    }
    return config;
  }

  return {
    user: process.env.PGUSER || "postgres",
    host: process.env.PGHOST || "localhost",
    database: process.env.PGDATABASE || "waste_management",
    password: process.env.PGPASSWORD || "scienty@2",
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
  };
}

async function connectPostgres() {
  const { Pool } = require("pg");
  const pool = new Pool(postgresConfig());

  await pool.query("SELECT 1");
  await pool.query(POSTGRES_SCHEMA);

  return {
    type: "postgres",
    query: (sql, params = []) => pool.query(sql, params),
  };
}

function normalizeSql(sql, params) {
  const orderedParams = [];
  const normalizedSql = sql.replace(/\$(\d+)/g, (_match, index) => {
    orderedParams.push(params[Number(index) - 1]);
    return "?";
  });

  return {
    sql: normalizedSql,
    params: orderedParams.length ? orderedParams : params,
  };
}

async function connectSqlite() {
  const initSqlJs = require("sql.js");
  const SQL = await initSqlJs();
  const sqlitePath = process.env.SQLITE_PATH || path.join(process.cwd(), "db", "local.sqlite");
  const sqliteDir = path.dirname(sqlitePath);

  fs.mkdirSync(sqliteDir, { recursive: true });

  const db = fs.existsSync(sqlitePath)
    ? new SQL.Database(fs.readFileSync(sqlitePath))
    : new SQL.Database();

  db.run("PRAGMA foreign_keys = ON;");
  db.run(SQLITE_SCHEMA);
  persistSqlite(db, sqlitePath);

  return {
    type: "sqlite",
    query: async (sql, params = []) => {
      const normalized = normalizeSql(sql, params);
      const trimmed = normalized.sql.trim().toUpperCase();
      const stmt = db.prepare(normalized.sql);
      const rows = [];

      try {
        stmt.bind(normalized.params);
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
      } finally {
        stmt.free();
      }

      if (
        trimmed.startsWith("INSERT") ||
        trimmed.startsWith("UPDATE") ||
        trimmed.startsWith("DELETE") ||
        trimmed.startsWith("CREATE") ||
        trimmed.startsWith("ALTER")
      ) {
        persistSqlite(db, sqlitePath);
      }

      return { rows };
    },
  };
}

function persistSqlite(db, sqlitePath) {
  fs.writeFileSync(sqlitePath, Buffer.from(db.export()));
}

async function initDb() {
  if (activeDb) return activeDb;

  if (!initPromise) {
    initPromise = connectPostgres()
      .catch(async (err) => {
        console.warn(`PostgreSQL unavailable, using local SQLite database: ${err.message}`);
        return connectSqlite();
      })
      .then((db) => {
        activeDb = db;
        return db;
      });
  }

  return initPromise;
}

module.exports = {
  query: async (sql, params = []) => {
    const db = await initDb();
    return db.query(sql, params);
  },
  initDb,
};
