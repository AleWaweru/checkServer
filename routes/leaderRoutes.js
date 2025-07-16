import express from "express";
import { createLeader, getGlobalLeaderPerformance, getLeaderById, getLeaders, updateLeader } from "../controllers/leaderController.js";
import { verifyToken } from "../middleware/jwt/verifyToken.js";
import { isAdmin } from "../middleware/roles/adminRoles.js";



const router = express.Router();

// Public: Get all leaders
router.get("/getLeaders",verifyToken, getLeaders);
router.get("/performance", getGlobalLeaderPerformance);
// Public: Get a specific leader
router.get("getById/:id",verifyToken, getLeaderById);

// Admin only: Create leader
router.post("/", verifyToken, isAdmin, createLeader);
router.put("/:id", verifyToken, isAdmin, updateLeader);


export default router;
