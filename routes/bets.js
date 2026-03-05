// routes/bets.js — sync and fetch bets

const express     = require("express");
const { pool }    = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// POST /bets/sync — extension pushes bets here
// Body: { bets: [ { orderId, name, odds, stake, ret, status, date, isAcca } ] }
router.post("/sync", requireAuth, async (req, res) => {
  const { bets } = req.body;

  if (!Array.isArray(bets) || bets.length === 0) {
    return res.status(400).json({ error: "No bets provided" });
  }

  try {
    let inserted = 0, updated = 0;

    for (const bet of bets) {
      const result = await pool.query(`
        INSERT INTO bets (user_id, order_id, name, odds, stake, ret, status, bet_date, is_acca)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (user_id, order_id) DO UPDATE SET
          name     = EXCLUDED.name,
          odds     = EXCLUDED.odds,
          stake    = EXCLUDED.stake,
          ret      = EXCLUDED.ret,
          status   = EXCLUDED.status,
          bet_date = EXCLUDED.bet_date,
          is_acca  = EXCLUDED.is_acca
        RETURNING (xmax = 0) AS was_inserted
      `, [
        req.userId,
        bet.orderId || bet.order_id || "",
        bet.name    || "",
        bet.odds    || "",
        parseFloat(bet.stake) || 0,
        parseFloat(bet.ret)   || 0,
        bet.status  || "pending",
        bet.date    ? new Date(bet.date) : null,
        bet.isAcca  || bet.is_acca || false,
      ]);

      if (result.rows[0]?.was_inserted) inserted++;
      else updated++;
    }

    // Update last sync time
    await pool.query(
      "UPDATE users SET last_sync = NOW() WHERE id = $1",
      [req.userId]
    ).catch(() => {}); // ignore if column doesn't exist yet

    res.json({
      success: true,
      inserted,
      updated,
      total: bets.length,
      message: `${inserted} new, ${updated} updated`,
    });

  } catch (err) {
    console.error("[bets/sync]", err);
    res.status(500).json({ error: "Server error during sync" });
  }
});

// GET /bets — PWA fetches all bets for the logged-in user
router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        order_id  AS "orderId",
        name,
        odds,
        stake::float,
        ret::float,
        status,
        bet_date  AS date,
        is_acca   AS "isAcca"
      FROM bets
      WHERE user_id = $1
      ORDER BY bet_date DESC NULLS LAST
    `, [req.userId]);

    res.json({ bets: result.rows });
  } catch (err) {
    console.error("[bets/get]", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /bets/stats — quick summary without sending all bets
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)                                          AS total,
        COUNT(*) FILTER (WHERE status = 'win')           AS wins,
        COUNT(*) FILTER (WHERE status = 'loss')          AS losses,
        COUNT(*) FILTER (WHERE status = 'void')          AS voids,
        COUNT(*) FILTER (WHERE status = 'pending')       AS pending,
        COALESCE(SUM(stake), 0)::float                   AS total_stake,
        COALESCE(SUM(ret), 0)::float                     AS total_ret,
        MAX(bet_date)                                     AS last_bet_date
      FROM bets
      WHERE user_id = $1
    `, [req.userId]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("[bets/stats]", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
