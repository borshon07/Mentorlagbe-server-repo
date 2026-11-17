import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Stripe webhook route pore ekhane express.raw() diye add hobe, express.json() er AGE
app.use(express.json());

app.get("/", (req, res) => {
  res.send("MentorLagbe server is running");
});

export default app;