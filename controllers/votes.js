import Vote from "../models/Vote.js";
import User from "../models/User.js";
import Match from "../models/Match.js";

/* VOTE BY USER */
export const makeVote = async (req, res) => {
  try {
    const { userId, matchId, selectedTeam, year } = req.body;
    const numericYear = Number(year); // Convert year to a number

    if (isNaN(numericYear)) {
      return res.status(400).json({ message: "Invalid year format" });
    }
    // create a new Vote object to represent the user's vote
    const user = await User.findById(userId);
    // const existingVote = user.votes.find((vote) => vote.matchId === matchId);
    const existingVote = user?.votes.find(
      (vote) => vote.matchId === matchId && Number(vote.year) === numericYear
    );

    if (existingVote) {
      res.status(400).send("You have already voted for this match");
    } else {
      user.votes.push({ matchId, selectedTeam, year: numericYear });
    }

    await user.save();
    const vote = new Vote({
      userId,
      matchId,
      selectedTeam,
      year: numericYear,
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

export const getUserMatches = async (req, res) => {
  const { year } = req.query; // Take year from query
  try {
    const user = await User.findById(req.params.userId).populate("votes.match");
    const votes = user.votes.filter((vote) => vote.year === Number(year));
    const matches = await Match.find({ year });

    const matchData = [];

    votes.forEach((vote) => {
      const match = matches.find(
        (match) => match._id && match._id.toString() == vote.matchId
      );
      if (match) {
        const matchDataItem = {
          matchId: vote.matchId,
          matchNo: match.matchNo,
          team1: match.team1,
          team2: match.team2,
          selectedTeam: vote.selectedTeam,
          isWinner: vote.isCorrected,
        };
        if (match.winner !== null) {
          matchDataItem.winnerTeam = match.winner;
        }
        matchData.push(matchDataItem);
      }
    });

    res.status(200).json(matchData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
