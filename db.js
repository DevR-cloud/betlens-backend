// db.js — PostgreSQL connection + table setup

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("railway") || process.env.DATABASE_URL?.includes("render")
    ? { rejectUnauthorized: false }
    : false,
});

async function setupDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      email      TEXT UNIQUE NOT NULL,
      password   TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS bets (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      order_id   TEXT NOT NULL,
      name       TEXT,
      odds       TEXT,
      stake      NUMERIC(12,2) DEFAULT 0,
      ret        NUMERIC(12,2) DEFAULT 0,
      status     TEXT,
      bet_date   TIMESTAMPTZ,
      is_acca    BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, order_id)
    );

    CREATE INDEX IF NOT EXISTS bets_user_id_idx ON bets(user_id);
    CREATE INDEX IF NOT EXISTS bets_date_idx    ON bets(bet_date);
  `);
  console.log("[DB] Tables ready");
}

module.exports = { pool, setupDB };
