import express from "express";
import { login, forgotPassword, resetPassword } from "../controllers/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/forgot", forgotPassword);
router.post("/resetPassword", resetPassword);

// router.post("/resetPassword", resetPassword);



export default router;
