import User from "../models/User.js";

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { year } = req.query; // 🟢 Get year from query
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const votes = user._doc?.votes || [];

    const updatedUser = {
      ...user._doc,
      correctedVoteNew: votes.filter(
        (vote) => Number(vote.year) === Number(year) && vote.isCorrect
      ).length,
      totalVoteNew: votes.filter((vote) => Number(vote.year) === Number(year))
        .length,
    };

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
