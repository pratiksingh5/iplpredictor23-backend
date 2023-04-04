import express from "express";

import { makeVote } from "../controllers/votes.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post('/makevote', verifyToken, makeVote);

export default router;
