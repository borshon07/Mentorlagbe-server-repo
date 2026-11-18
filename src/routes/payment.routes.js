import express from "express";
import {
  createCheckoutSession,
  verifySession,
} from "../controllers/payment.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/create-checkout-session", verifyToken, createCheckoutSession);
router.get("/verify", verifyToken, verifySession);

export default router;
