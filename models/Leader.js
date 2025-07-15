import mongoose from "mongoose";

const manifestoSchema = new mongoose.Schema({
  title: { type: String, required: true },
});

const leaderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: {
      type: String,
      enum: ["president", "governor", "mp", "mca"],
      required: true,
    },
    level: {
      type: String,
      enum: ["country", "county", "constituency", "ward"],
      required: true,
    },
    manifesto: [manifestoSchema],
    county: { type: String },
    constituency: { type: String },
    ward: { type: String },
  },
  {
    timestamps: true,
  }
);

const Leader = mongoose.model("Leader", leaderSchema);
export default Leader;
