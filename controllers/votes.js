import Vote from "../models/Vote.js";
import User from "../models/User.js";
import Match from "../models/Match.js";

/* VOTE BY USER */

export const makeVote = async (req, res) => {
  try {
    const { userId, matchId, selectedTeam } = req.body;
    // create a new Vote object to represent the user's vote
    const user = await User.findById(userId);
    const existingVote = user.votes.find((vote) => vote.matchId === matchId);
    if (existingVote) {
      res.status(400).send("You have already voted for this match");
    } else {
      user.votes.push({
        matchId,
        selectedTeam,
      });
    }
    // update the user's record with the new vote
    // user.votes.push({
    //   matchId,
    //   selectedTeam,
    // });
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


export const getUserMatches = async(req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('votes.match');
    const votes = user.votes;
    const matches = await Match.find();
    const matchData = [];

    votes.forEach(vote => {
      const match = matches.find(match => match._id && match._id.toString() == vote.matchId);
      if (match) {
        matchData.push({
          matchId: vote.matchId,
          matchNo: match.matchNo,
          team1: match.team1,
          team2: match.team2,
          selectedTeam: vote.selectedTeam,
          isWinner: vote.isCorrected
        });
      }
    });

    res.status(200).json(matchData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


