import express from "express";

const router = express.Router();

export default (db) => {
  // 🔸 Track a profile visit
  router.post("/profile-visit/", async (req, res) => {
    const { profileId, viewerId } = req.body;

    if (!profileId || !viewerId || profileId === viewerId) {
      return res.status(400).json({ error: "Invalid request" });
    }

    try {
      // Check if viewer already visited this profile within last 1 hour
      const result = await db.query(
        `
      SELECT 1 FROM profile_visits
      WHERE profile_id = $1 AND viewer_id = $2
        AND visited_at >= NOW() - INTERVAL '1 hour'
      LIMIT 1
      `,
        [profileId, viewerId]
      );

      if (result.rowCount === 0) {
        // No recent visit → insert new record
        await db.query(
          "INSERT INTO profile_visits (profile_id, viewer_id) VALUES ($1, $2)",
          [profileId, viewerId]
        );
        return res.status(200).json({ success: true, inserted: true });
      } else {
        // Already visited within the last hour → skip
        return res.status(200).json({ success: true, inserted: false, message: "Visit already recorded within 1 hour" });
      }
    } catch (err) {
      console.error("Insert error:", err.message);
      return res.status(500).json({ error: "DB error" });
    }
  });

  router.get("/profile-views/:id", async (req, res) => {
    const profileId = req.params.id;

    try {
      // Total profile views
      const totalResult = await db.query(
        "SELECT COUNT(*) AS visit_count FROM profile_visits WHERE profile_id = $1",
        [profileId]
      );

      // Daily visits for the past 7 days
      const breakdownResult = await db.query(`
        SELECT
          TO_CHAR(visited_at::date, 'YYYY-MM-DD') AS date,
          COUNT(*) AS count
        FROM profile_visits
        WHERE profile_id = $1
          AND visited_at >= NOW() - INTERVAL '7 days'
        GROUP BY visited_at::date
        ORDER BY date ASC
      `, [profileId]);

      const breakdown = {};
      for (const row of breakdownResult.rows) {
        breakdown[row.date] = parseInt(row.count);
      }

      res.json({
        visitCount: parseInt(totalResult.rows[0].visit_count),
        dailyBreakdown: breakdown
      });
    } catch (err) {
      console.error("Analytics error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
};
