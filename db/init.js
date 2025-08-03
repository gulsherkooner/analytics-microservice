import pkg from "pg";
const { Pool } = pkg;

export const db = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "postgres",
  password: process.env.PGPASSWORD || "123456",
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

// Ensure DB table exists
export const initDB = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS profile_visits (
        id SERIAL PRIMARY KEY,
        profile_id TEXT NOT NULL,
        viewer_id TEXT NOT NULL,
        visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ profile_visits table ready.");
  } catch (err) {
    console.error("❌ DB initialization error:", err);
  }
};
