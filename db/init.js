import pkg from "pg";
const { Pool } = pkg;

export const db = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "postgres",
  password: process.env.PGPASSWORD || "123456",
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

export const initDB = async () => {
  try {
    // Existing profile_visits table
    await db.query(`
      CREATE TABLE IF NOT EXISTS profile_visits (
        id SERIAL PRIMARY KEY,
        profile_id TEXT NOT NULL,
        viewer_id TEXT NOT NULL,
        visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ✅ New daily_watch_time table
    await db.query(`
      CREATE TABLE IF NOT EXISTS daily_watch_time (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        date DATE NOT NULL,
        total_watch_time FLOAT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, date)
      );
    `);

    console.log("✅ daily_watch_time table ready.");
  } catch (err) {
    console.error("❌ DB initialization error:", err);
  }
};
