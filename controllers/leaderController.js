import Leader from "../models/Leader.js";
import Review from "../models/Review.js";
import User from "../models/User.js";

// Create a new leader (admin only)
export const createLeader = async (req, res) => {
  const { name, position, level, manifesto, county, constituency, ward } = req.body;

  try {
    const query = {
      name,
      position,
      level,
      ...(county && { county }),
      ...(constituency && { constituency }),
      ...(ward && { ward }),
    };

    const existingLeader = await Leader.findOne(query);

    if (existingLeader) {
      return res.status(409).json({ message: "Leader already exists for this region and position." });
    }

    const leader = new Leader({
      name,
      position,
      level,
      manifesto,
      county,
      constituency,
      ward,
    });

    await leader.save();
    res.status(201).json({ message: "Leader created successfully", leader });
  } catch (err) {
    res.status(500).json({ message: "Failed to create leader", error: err.message });
  }
};

export const getLeaders = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    let leaders;

    if (user.role === "admin") {
      leaders = await Leader.find();
    } else {
      leaders = await Leader.find({
        $or: [
          { position: "president" },
          { county: user.county, level: "county" },
          { constituency: user.constituency, level: "constituency" },
          { ward: user.ward, level: "ward" },
        ],
      });
    }

    res.status(200).json(leaders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch leaders", error: err.message });
  }
};


// Get leader by ID
export const getLeaderById = async (req, res) => {
  try {
    const leader = await Leader.findById(req.params.id);
    if (!leader) return res.status(404).json({ message: "Leader not found" });
    res.status(200).json(leader);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving leader", error: err.message });
  }
};
 
// Update leader (admin only)
export const updateLeader = async (req, res) => {
  const { id } = req.params;
  const { name, position, level, manifesto } = req.body;

  try {
    const leader = await Leader.findById(id);
    if (!leader) return res.status(404).json({ message: "Leader not found" });

    // Update fields
    leader.name = name || leader.name;
    leader.position = position || leader.position;
    leader.level = level || leader.level;
    leader.manifesto = manifesto || leader.manifesto;

    const updatedLeader = await leader.save();
    res.status(200).json({ message: "Leader updated", leader: updatedLeader });
  } catch (err) {
    res.status(500).json({ message: "Failed to update leader", error: err.message });
  }
};

// Get all leaders with their global performance score
export const getGlobalLeaderPerformance = async (req, res) => {
  try {
    const leaders = await Leader.find();
    const reviews = await Review.find();
    const leaderPerformance = leaders.map((leader) => {
      const leaderReviews = reviews.filter((review) => review.leaderId.toString() === leader._id.toString());
      const allScores = leaderReviews.flatMap((review) =>
        Object.values(review.ratings || {}).filter((val) => typeof val === "number")
      );

      const average =
        allScores.length > 0
          ? parseFloat((allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2))
          : 0;

      return {
        _id: leader._id,
        name: leader.name,
        position: leader.position,
        level: leader.level,
        county: leader.county || "",
        constituency: leader.constituency || "",
        ward: leader.ward || "",
        manifesto: leader.manifesto || [],
        averageRating: average,
        totalReviews: leaderReviews.length,
      };
    });
    leaderPerformance.sort((a, b) => b.averageRating - a.averageRating);

    res.status(200).json(leaderPerformance);
  } catch (err) {
    res.status(500).json({ message: "Failed to calculate leader performance", error: err.message });
  }
};

// Delete leader (admin only)
export const deleteLeader = async (req, res) => {
  const { id } = req.params;

  try {
    const leader = await Leader.findById(id);
    if (!leader) {
      return res.status(404).json({ message: "Leader not found" });
    }

    await Leader.findByIdAndDelete(id);

    // Optionally, delete related reviews
    await Review.deleteMany({ leaderId: id });

    res.status(200).json({ message: "Leader deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete leader", error: err.message });
  }
};
