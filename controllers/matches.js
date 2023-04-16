import Match from "../models/Match.js";
import User from "../models/User.js";

/* READ */
export const getAllMatches = async (req, res) => {
  try {
    const matches = await Match.find();
    res.status(200).json(matches);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Update a Match Winner
// export const updateWinner = async (req, res) => {
//   try {
//     const matchId = req.params.matchId;
//     const winner = req.body.winner;

//     await Match.updateOne({ _id: matchId }, { winner: winner });
//     res.json({ message: "Match winner updated" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

//Update User Vote
// export const updateUserVote = async (req, res) => {
//   try {
//     const matchId = req.body.matchId;
//     const winner = req.body.winner;

//     // const users = await User.find({ matchId: matchId, selectedTeam: winner });
//     const users = await User.find({
//       votes: { $elemMatch: { matchId: matchId, selectedTeam: winner } },
//     });
//     users.forEach(async (user) => {
//       const vote = user.votes.find(
//         (v) => v.matchId == matchId && v.selectedTeam == winner
//       );
//       if (vote) {
//         const voteIndex = user.votes.findIndex(
//           (v) => v.matchId == matchId && v.selectedTeam == winner
//         );
//         if (voteIndex >= 0) {
//           user.votes[voteIndex].isCorrect = true;
//           await user.save();
//         }
//       }
//     });

//     res.json({ message: "User votes updated Yes" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

//Update Winner and User Vote
export const updateWinnerAndUserVote = async (req, res) => {
  try {
    const matchId = req.body.matchId;
    const winner = req.body.winner;

    await Match.updateOne({ _id: matchId }, { winner: winner });
    await User.updateMany(
      { 'votes.matchId': matchId, 'votes.selectedTeam': winner },
      { $set: { 'votes.$[vote].isCorrect': true } },
      { arrayFilters: [{ 'vote.matchId': matchId, 'vote.selectedTeam': winner }] }
    );

    res.json({ message: "User votes updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
