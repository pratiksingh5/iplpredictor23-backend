import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const updateUserVotes = async () => {
  console.log("🔄 Adding year in User's votes...");
  await mongoose.connection.db.collection("users").updateMany(
    {},
    {
      $set: {
        "votes.$[].year": 2024,
      },
    }
  );
};

const updateMatches = async () => {
  console.log("🔄 Adding year in Matches...");
  await mongoose.connection.db.collection("matches").updateMany(
    {},
    {
      $set: {
        year: 2024,
      },
    }
  );
};

const updateVotesCollection = async () => {
  console.log("🔄 Adding year in Votes collection...");
  await mongoose.connection.db.collection("votes").updateMany(
    {},
    {
      $set: {
        year: 2024,
      },
    }
  );
};

const updateDatabase = async () => {
  await connectDB();
  await updateUserVotes();
  await updateMatches();
  await updateVotesCollection();
  mongoose.connection.close();
  console.log("✅ Migration Done!");
};

(async () => {
  try {
    await updateDatabase();
  } catch (error) {
    console.error("❌ Error during migration:", error);
  }
})();
