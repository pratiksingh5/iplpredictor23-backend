import express from "express";
import {
  getUser,
  updateUser
} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/:id", getUser);
router.put("/:id", verifyToken, updateUser);

// router.get('/getAllUser', getAllUser)
// router.get("/:id/friends", verifyToken, getUserFriends);

/* UPDATE */
// router.patch("/:id/:friendId", verifyToken, addRemoveFriend);

export default router;
