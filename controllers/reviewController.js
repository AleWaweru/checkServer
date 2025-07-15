import Review from "../models/Review.js";

// Create a new review
export const createReview = async (req, res) => {
  const { leaderId, userId, ratings } = req.body;

  if (!leaderId || !userId || !ratings) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const existing = await Review.findOne({ leaderId, userId }).sort({
      createdAt: -1,
    });

    if (existing) {
      const now = new Date();
      const reviewDate = new Date(existing.createdAt);
      const diffInMonths =
        (now.getFullYear() - reviewDate.getFullYear()) * 12 +
        now.getMonth() -
        reviewDate.getMonth();

      if (diffInMonths < 3) {
        const nextAllowedDate = new Date(reviewDate);
        nextAllowedDate.setMonth(nextAllowedDate.getMonth() + 3);

        return res.status(409).json({
          message: "You can only submit a review every 3 months.",
          nextReviewDate: nextAllowedDate,
        });
      }
    }

    const review = new Review({ leaderId, userId, ratings });
    await review.save();

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to submit review", error: err.message });
  }
};

// Get all reviews for a leader
export const getReviewsByLeader = async (req, res) => {
  const { leaderId } = req.params;

  try {
    const reviews = await Review.find({ leaderId }).populate(
      "userId",
      "firstName email"
    );
    res.status(200).json(reviews);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch reviews", error: err.message });
  }
};

// Get all reviews (admin or analytics use)
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("userId", "firstName email");
    res.status(200).json(reviews);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch all reviews", error: err.message });
  }
};
