import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import matchRoutes from "./routes/matches.js";
import voteRoutes from "./routes/votes.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { register } from "./controllers/auth.js";
import User from "./models/User.js";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

app.use(
  cors({
    origin: "https://iplpredictors.netlify.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// Cloudinary configuration
cloudinary.config({
  cloud_name: "vbushoutout",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    allowed_formats: ["jpg", "png", "jpeg"], // Allowed formats
  },
});

const upload = multer({ storage });

// API Route
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const result = req.file.path; // Cloudinary URL
    res.status(200).json({ imageUrl: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

/* ROUTES WITH FILES */
app.post("/auth/register", register);
app.get("/getAllUsers", async (req, res) => {
  try {
    const { year } = req.query;
    const numericYear = Number(year);

    const users = await User.aggregate([
      {
        $addFields: {
          filteredVotes: {
            $filter: {
              input: "$votes",
              as: "vote",
              cond: { $eq: ["$$vote.year", numericYear] },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          instaUsername: 1,
          picturePath: 1,
          correctedVoteNew: {
            $size: {
              $filter: {
                input: "$filteredVotes",
                as: "vote",
                cond: { $eq: ["$$vote.isCorrect", true] },
              },
            },
          },
          totalVoteNew: { $size: "$filteredVotes" },
        },
      },
    ]);

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/matches", matchRoutes);
app.use("/votes", voteRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};

const PORT = process.env.PORT || 3001;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
