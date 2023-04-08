import express from "express";

import { makeVote, getUserMatches } from "../controllers/votes.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post('/makevote', verifyToken, makeVote);
router.get('/:userId', getUserMatches)

export default router;
