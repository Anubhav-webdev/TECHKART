import express from "express";
import { Feedback } from "../../Schema/feedbackSchema.js";
import { User } from "../../Schema/userSchema.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ feedbacks });
  } catch (err) {
    console.error("Get feedback error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { userId, problem } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!problem || !problem.trim()) {
      return res.status(400).json({ message: "Problem description is required" });
    }

    const user = await User.findById(userId).select("username email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const feedbackCount = await Feedback.countDocuments({
      userId,
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    });

    if (feedbackCount >= 5) {
      return res.status(429).json({
        message: "Daily feedback limit reached. You can submit up to 5 feedbacks per day.",
      });
    }

    const feedback = await Feedback.create({
      userId,
      username: user.username,
      email: user.email,
      problem: problem.trim(),
    });

    return res.status(201).json({ message: "Feedback submitted successfully", feedback });
  } catch (err) {
    console.error("Submit feedback error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFeedback = await Feedback.findByIdAndDelete(id);
    if (!deletedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    return res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (err) {
    console.error("Delete feedback error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
