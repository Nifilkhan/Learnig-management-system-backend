import express from "express";
import { signin, signup, verifyOtp } from "../controllers/authController.js";


const router = express.Router();

router.post('/signup',signup)

router.post('/verify-otp',verifyOtp)

router.post('/signin',signin)

export default router;