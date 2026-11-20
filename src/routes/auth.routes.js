import express from "express";
import jwt from "jsonwebtoken";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../config/auth.js";

const router = express.Router();

// Session thakle JWT dey
router.get("/token", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { id, email, role, name } = session.user;

    const token = jwt.sign({ id, email, role, name }, process.env.JWT_SECRET, {
      expiresIn: "1h",
      algorithm: "HS256",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate token" });
  }
});

export default router;
