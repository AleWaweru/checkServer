import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leader",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or "Account" depending on your schema
      required: true,
    },
    ratings: {
      type: Map,
      of: Number, // key = manifesto title, value = 1 to 4
      required: true,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
