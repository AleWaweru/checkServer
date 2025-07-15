import express from "express";
import { createLeader, getGlobalLeaderPerformance, getLeaderById, getLeaders } from "../controllers/leaderController.js";
import { verifyToken } from "../middleware/jwt/verifyToken.js";



const router = express.Router();

// Public: Get all leaders
router.get("/getLeaders",verifyToken, getLeaders);
router.get("/performance", getGlobalLeaderPerformance);
// Public: Get a specific leader
router.get("getById/:id",verifyToken, getLeaderById);

// Admin only: Create leader
router.post("/", verifyToken, createLeader);

export default router;
