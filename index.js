import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import leaderRoutes from "./routes/leaderRoutes.js";
import reviewsRoutes from "./routes/reviewRoute.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  "https://checks-qtvn.onrender.com",
  "http://localhost:5173"           
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/leaders", leaderRoutes);
app.use("/api/reviews", reviewsRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

connectDB();
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
