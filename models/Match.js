import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
    matchNo : {type: Number, required: true},
    team1: { type: String, required: true },
    team2: { type: String, required: true },
    date: { type: Date, required: true },
    winner: { type: String, default: null },
  });

const Match = mongoose.model("Match", matchSchema);

export default Match;