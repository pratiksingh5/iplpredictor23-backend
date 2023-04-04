import Vote from "../models/Vote.js";
import User from "../models/User.js";

/* VOTE BY USER */

export const makeVote = async (req, res) => {
  try {
    const { userId, matchId, selectedTeam } = req.body;
    // create a new Vote object to represent the user's vote
    const user = await User.findById(userId);
    // update the user's record with the new vote
    user.votes.push({
      matchId,
      selectedTeam,
    });
    // save the updated user record to the database
    await user.save();
    const vote = new Vote({
      userId,
      matchId,
      selectedTeam,
    });
    // save the vote to the database
    vote.save((err) => {
      if (err) {
        console.error(err);
        res.status(500).send("An error occurred while saving your vote");
      } else {
        res.status(200).send("Your vote has been saved successfully");
      }
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
