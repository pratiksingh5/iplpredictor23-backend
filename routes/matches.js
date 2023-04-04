import express from "express";
import { getAllMatches, updateWinner, updateUserVote, updateWinnerAndUserVote} from "../controllers/matches.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
// router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/allmatches", verifyToken, getAllMatches);
router.put('/updateWinner',verifyToken, updateWinner)
router.put('/updateUserVote', verifyToken,updateUserVote )
router.put('/update',verifyToken,updateWinnerAndUserVote )


/* UPDATE */
// router.patch("/:id/like", verifyToken, likePost);

export default router;
