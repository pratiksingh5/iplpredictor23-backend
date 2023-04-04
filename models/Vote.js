import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
    userId: {
      type: String,
      required: true,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
    },
    selectedTeam: {
      type: String,
      required: true,
    },
  });

const Vote = mongoose.model("Vote", voteSchema);

export default Vote;