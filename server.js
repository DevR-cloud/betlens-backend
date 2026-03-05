// server.js — BetLens backend

require("dotenv").config();

const express   = require("express");
const cors      = require("cors");
const { setupDB } = require("./db");
const authRoutes = require("./routes/auth");
const betsRoutes = require("./routes/bets");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({
  origin: "*", // lock this down to your domain once live
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" })); // bets payload can be large

// ── Routes ────────────────────────────────────────────────────────────────────

app.get("/health", (req, res) => res.json({ ok: true, time: new Date() }));

app.use("/auth", authRoutes);
app.use("/bets", betsRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Error handler
app.use((err, req, res, next) => {
  console.error("[server error]", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────────────

setupDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[BetLens] Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("[BetLens] Failed to connect to database:", err.message);
    process.exit(1);
  });
