import express from "express";
import cors from "cors";
import { db, initDB } from "./db/init.js";
import profileVisitRoutes from "./routes/profileVisits.js";
import watchTimeRoutes from "./routes/watchTime.js";
const app = express();
app.use(cors());
app.use(express.json());

await initDB(); // Ensures table is ready

app.use("/analytics", profileVisitRoutes(db));
app.use('/watch-time', watchTimeRoutes);
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`🚀 Analytics API running on ${PORT}`));
