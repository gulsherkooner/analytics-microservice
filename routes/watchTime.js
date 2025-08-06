import express from "express";
import { db } from "../db/init.js";

const router = express.Router();

router.post("/daily", async (req, res) => {
  const { watch_time,user_id } = req.body;
  if (!watch_time || !user_id) {
    return res.status(400).json({ error: "Missing watch_time or user_id" });
  }

  const today = new Date().toISOString().slice(0, 10);

  try {
    await db.query(
      `
      INSERT INTO daily_watch_time (user_id, date, total_watch_time)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, date)
      DO UPDATE SET 
        total_watch_time = daily_watch_time.total_watch_time + EXCLUDED.total_watch_time,
        updated_at = CURRENT_TIMESTAMP
    `,
      [user_id, today, watch_time]
    );

    res.status(200).json({ message: "Watch time recorded successfully." });
  } catch (err) {
    console.error("Error recording watch time:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/daily/:user_id/total", async (req, res) => {
  const { user_id } = req.params;

  try {
    // Fetch all entries grouped by date
    const { rows } = await db.query(
      `
      SELECT date, total_watch_time
      FROM daily_watch_time
      WHERE user_id = $1
      ORDER BY date ASC
      `,
      [user_id]
    );

    let total_watch_time = 0;
    const watch_time_by_date = rows.map(row => {
      const date = row.date.toISOString().split("T")[0];
      const time = parseInt(row.total_watch_time);
      total_watch_time += time;
      return {
        date,
        watch_time: time
      };
    });

    res.json({
      user_id,
      total_watch_time,
      watch_time_by_date
    });
  } catch (err) {
    console.error("Error fetching watch time:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
