import express from "express";
import { getAllMatches, updateWinnerAndUserVote, addMatches} from "../controllers/matches.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/allmatches", verifyToken, getAllMatches);
router.put('/update',verifyToken,updateWinnerAndUserVote )
router.post("/add", addMatches);

export default router;
