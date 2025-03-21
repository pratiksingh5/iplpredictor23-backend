import Match from "../models/Match.js";
import User from "../models/User.js";
import { matches } from "../data/matches.js";

/* READ */
export const getAllMatches = async (req, res) => {
  const { year } = req.query; // Extract year from query params
  try {
    const matches = await Match.find(year ? { year } : {});
    res.status(200).json(matches);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

//Update Winner and User Vote
export const updateWinnerAndUserVote = async (req, res) => {
  try {
    const { matchId, winner } = req.body;

    // Update match winner
    await Match.updateOne({ _id: matchId }, { winner: winner });

    // Reset isCorrect for all users who voted on this match
    await User.updateMany(
      { "votes.matchId": matchId },
      { $set: { "votes.$[vote].isCorrect": false } },
      { arrayFilters: [{ "vote.matchId": matchId }] }
    );

    // Set isCorrect = true for users who voted for the updated winner
    await User.updateMany(
      { "votes.matchId": matchId, "votes.selectedTeam": winner },
      { $set: { "votes.$[vote].isCorrect": true } },
      {
        arrayFilters: [
          { "vote.matchId": matchId, "vote.selectedTeam": winner },
        ],
      }
    );

    res.json({ message: "User votes updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addMatches = async (req, res) => {
  try {
    if (!Array.isArray(matches)) {
      return res
        .status(400)
        .json({ message: "Invalid data format. Expected an array." });
    }

    const insertedMatches = await Match.insertMany(matches);
    res
      .status(201)
      .json({ message: "Matches added successfully!", data: insertedMatches });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
