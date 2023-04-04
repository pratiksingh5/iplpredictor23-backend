import express from "express";
import { login } from "../controllers/auth.js";

const router = express.Router();

router.post("/login", login);
// router.post("/forgotPassword", forgotPassword);
// router.post("/resetPassword", resetPassword);



export default router;
