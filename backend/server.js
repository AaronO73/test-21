const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const fetch = require("node-fetch");

// --- Configuration ---
const PORT = process.env.PORT || 4000;
const DATABASE_URL = process.env.DATABASE_URL;
const TRADE_FEE_RATE = 0.001;
const SLIPPAGE_RATE = 0.002;

const CRYPTO_MAP = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
};

// --- In-memory fallback data ---
const memoryState = {
  user: {
    id: 1,
    email: "demo@simutrade.io",
    cash: 25000,
    currency: "USD",
  },
  portfolio: [
    { symbol: "AAPL", quantity: 12, averagePrice: 170.12 },
    { symbol: "BTC", quantity: 0.4, averagePrice: 28000.0 },
  ],
  trades: [
    {
      id: 1,
      symbol: "AAPL",
      type: "buy",
      price: 168.25,
      quantity: 10,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
};

const app = express();
app.use(cors());
app.use(express.json());

// --- Database helper ---
const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL }) : null;

const getUser = async () => {
  if (!pool) return memoryState.user;
  const result = await pool.query("SELECT * FROM users WHERE id = 1;");
  return result.rows[0];
};

const getHoldings = async () => {
  if (!pool) return memoryState.portfolio;
  const result = await pool.query(
    'SELECT symbol, quantity, average_price AS "averagePrice" FROM portfolio WHERE user_id = 1;'
  );
  return result.rows;
};

const getTrades = async () => {
  if (!pool) return memoryState.trades;
  const result = await pool.query(
    "SELECT id, symbol, type, price, quantity, timestamp FROM trades WHERE user_id = 1 ORDER BY timestamp DESC;"
  );
  return result.rows;
};

const insertTrade = async (trade) => {
  if (!pool) {
    memoryState.trades.unshift({ id: memoryState.trades.length + 1, ...trade });
    return;
  }
  await pool.query(
    "INSERT INTO trades (user_id, symbol, type, price, quantity, timestamp) VALUES ($1,$2,$3,$4,$5,$6);",
    [1, trade.symbol, trade.type, trade.price, trade.quantity, trade.timestamp]
  );
};

const updateUserCash = async (cash) => {
  if (!pool) {
    memoryState.user.cash = cash;
    return;
  }
  await pool.query("UPDATE users SET cash = $1 WHERE id = 1;", [cash]);
};

const updateHolding = async (symbol, quantity, averagePrice) => {
  if (!pool) {
    const existing = memoryState.portfolio.find((h) => h.symbol === symbol);
    if (existing) {
      existing.quantity = quantity;
      existing.averagePrice = averagePrice;
    } else {
      memoryState.portfolio.push({ symbol, quantity, averagePrice });
    }
    memoryState.portfolio = memoryState.portfolio.filter((h) => h.quantity > 0);
    return;
  }

  await pool.query(
    "INSERT INTO portfolio (user_id, symbol, quantity, average_price) VALUES ($1,$2,$3,$4) ON CONFLICT (user_id, symbol) DO UPDATE SET quantity=$3, average_price=$4;",
    [1, symbol, quantity, averagePrice]
  );
};

// --- Market data ---
const fetchCryptoData = async (symbol) => {
  const id = CRYPTO_MAP[symbol];
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=30`
  );
  const data = await response.json();
  const history = data.prices.map(([ts, price]) => ({
    date: new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    price,
  }));
  return { latestPrice: history.at(-1)?.price ?? 0, history };
};

const fetchStockData = async (symbol) => {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1mo&interval=1d`
  );
  const data = await response.json();
  const result = data.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const prices = result?.indicators?.quote?.[0]?.close ?? [];

  const history = timestamps.map((ts, i) => ({
    date: new Date(ts * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    price: prices[i] ?? 0,
  }));

  return { latestPrice: history.at(-1)?.price ?? 0, history };
};

const fetchMarketData = async (symbol) =>
  CRYPTO_MAP[symbol] ? fetchCryptoData(symbol) : fetchStockData(symbol);

// --- API ---
app.get("/api/stocks", async (req, res) => {
  try {
    const symbol = (req.query.symbol || "AAPL").toUpperCase();
    res.json(await fetchMarketData(symbol));
  } catch {
    res.status(500).json({ error: "Failed to fetch market data." });
  }
});

app.get("/api/health", (_, res) => {
  res.json({ status: "ok" });
});

app.get("/api/portfolio", async (_, res) => {
  try {
    const user = await getUser();
    const holdings = await getHoldings();

    const enriched = await Promise.all(
      holdings.map(async (h) => {
        const market = await fetchMarketData(h.symbol);
        return { ...h, marketValue: h.quantity * market.latestPrice };
      })
    );

    const portfolioValue = enriched.reduce((t, h) => t + h.marketValue, 0);

    res.json({
      cash: user.cash,
      currency: user.currency,
      holdings: enriched,
      portfolioValue,
      totalEquity: user.cash + portfolioValue,
    });
  } catch {
    res.status(500).json({ error: "Failed to load portfolio." });
  }
});

app.get("/api/history", async (_, res) => {
  try {
    res.json(await getTrades());
  } catch {
    res.status(500).json({ error: "Failed to load trade history." });
  }
});

app.post("/api/trade", async (req, res) => {
  try {
    const { symbol, side, quantity, orderType, limitPrice } = req.body;
    if (!symbol || !side || quantity <= 0) {
      return res.status(400).json({ error: "Invalid trade request." });
    }

    const normalized = symbol.toUpperCase();
    const market = await fetchMarketData(normalized);
    const marketPrice = market.latestPrice;

    if (
      orderType === "limit" &&
      ((side === "buy" && marketPrice > limitPrice) ||
        (side === "sell" && marketPrice < limitPrice))
    ) {
      return res.status(409).json({ error: "Limit order not filled." });
    }

    const executionPrice =
      side === "buy"
        ? marketPrice * (1 + SLIPPAGE_RATE)
        : marketPrice * (1 - SLIPPAGE_RATE);

    const fee = executionPrice * quantity * TRADE_FEE_RATE;
    const tradeCost = executionPrice * quantity + (side === "buy" ? fee : -fee);

    const user = await getUser();
    const holdings = await getHoldings();
    const existing = holdings.find((h) => h.symbol === normalized);

    if (side === "buy") {
      if (user.cash < tradeCost) {
        return res.status(400).json({ error: "Insufficient cash." });
      }
      const newQty = (existing?.quantity ?? 0) + quantity;
      const totalCost =
        (existing?.averagePrice ?? 0) * (existing?.quantity ?? 0) +
        executionPrice * quantity;
      await updateUserCash(user.cash - tradeCost);
      await updateHolding(normalized, newQty, totalCost / newQty);
    } else {
      if (!existing || existing.quantity < quantity) {
        return res.status(400).json({ error: "Not enough holdings." });
      }
      await updateUserCash(user.cash + tradeCost);
      await updateHolding(normalized, existing.quantity - quantity, existing.averagePrice);
    }

    await insertTrade({
      symbol: normalized,
      type: side,
      price: executionPrice,
      quantity,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Trade execution failed." });
  }
});

app.get("/", (_, res) => {
  res.send(
    "SimuTrade backend is running. Use /api/health to check status or /api/* endpoints."
  );
});

app.listen(PORT, () => {
  console.log(`SimuTrade backend running on port ${PORT}`);
});
