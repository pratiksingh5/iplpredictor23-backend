import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import matchRoutes from "./routes/matches.js";
import voteRoutes from "./routes/votes.js"


import { register } from "./controllers/auth.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
// import Post from "./models/Post.js";
// import Match from "./models/Match.js"
// import { users, posts, matches } from "./data/index.js";
// import {matches} from "./data/Matches.js"

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* FILE STORAGE */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "tmp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
// const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
// app.post("/posts", verifyToken, upload.single("picture"), createPost);


app.get('/getAllUsers', async(req,res)=> {
    try {
      const users = await User.find();
      console.log(users)
      res.status(200).json(users);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
})

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/matches", matchRoutes);
app.use("/votes", voteRoutes);



/* MONGOOSE SETUP */
const PORT = process.env.PORT || 3001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /* ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
    // Match.insertMany(matches);
  })
  .catch((error) => console.log(`${error} did not connect`));
