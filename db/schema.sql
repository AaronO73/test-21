-- SimuTrade database schema for PostgreSQL

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  cash NUMERIC(14, 2) DEFAULT 10000,
  currency TEXT DEFAULT 'USD'
);

CREATE TABLE IF NOT EXISTS portfolio (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  quantity NUMERIC(18, 6) DEFAULT 0,
  average_price NUMERIC(14, 4) DEFAULT 0,
  PRIMARY KEY (user_id, symbol)
);

CREATE TABLE IF NOT EXISTS trades (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  type TEXT NOT NULL,
  price NUMERIC(14, 4) NOT NULL,
  quantity NUMERIC(18, 6) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
