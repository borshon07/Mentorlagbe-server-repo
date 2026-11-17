import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// BetterAuth handler: express.json() er AGE thakte hobe
app.all("/api/auth/*splat", toNodeHandler(auth));

// Stripe webhook pore ekhane express.raw() diye add hobe, express.json() er AGE
app.use(express.json());

app.get("/", (req, res) => {
  res.send("MentorLagbe server is running");
});

export default app;