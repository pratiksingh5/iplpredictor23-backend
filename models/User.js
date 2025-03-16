import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    instaUsername: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
    picturePath: {
      public_id: String,
      url: {
        type: String,
        default:
          "https://img.freepik.com/premium-vector/man-avatar-profile-round-icon_24640-14044.jpg?w=2000",
      },
    },
    role: {
      type: String,
      default: "user",
    },
    points: { type: Number, default: 0 },
    votes: [
      {
        match: { type: mongoose.Schema.Types.ObjectId, ref: "Match" },
        matchId: { type: String, required: true },
        selectedTeam: { type: String, required: true },
        isCorrect: { type: Boolean, default: false },
      },
    ],
    location: String,
    occupation: String,
    viewedProfile: Number,
    impressions: Number,
    totalVote: { type: Number, default: 0 },
    correctedVote: { type: Number, default: 0 },
    // ✅ Add these fields
    OTP: { type: String }, // Storing OTP as a string
    OTPExpiration: { type: Date }, // OTP expiration time
  },
  { timestamps: true }
);

UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

UserSchema.virtual("totalVoteNew").get(function () {
  return this.votes.length;
});

UserSchema.virtual("correctedVoteNew").get(function () {
  return this.votes.filter((vote) => vote.isCorrect).length;
});

// UserSchema.pre('save', function(next) {
//   this.totalVote = this.votes.length;
//   this.correctedVote = this.votes.filter(vote => vote.isCorrect).length;
//   next();
// });

const User = mongoose.model("User", UserSchema);
export default User;
