import express from "express";
import { createReview, getAllReviews, getReviewsByLeader } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", createReview); // POST /api/reviews
router.get("/allReviews", getAllReviews);
router.get("/:leaderId", getReviewsByLeader); // GET /api/reviews/:leaderId

export default router;
