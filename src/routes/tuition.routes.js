import express from "express";
import {
  getAllTuitions,
  getLatestTuitions,
  getTuitionById,
  createTuition,
  getMyTuitions,
  updateTuition,
  toggleTuitionStatus,
  deleteTuition,
} from "../controllers/tuition.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyTutor } from "../middlewares/verifyTutor.js";

const router = express.Router();

// Public
router.get("/", getAllTuitions);
router.get("/latest", getLatestTuitions);

// Tutor (ei route gulo "/:id" er AGE thakte hobe)
router.get("/my", verifyToken, verifyTutor, getMyTuitions);
router.post("/", verifyToken, verifyTutor, createTuition);
router.patch("/:id/toggle", verifyToken, verifyTutor, toggleTuitionStatus);
router.patch("/:id", verifyToken, verifyTutor, updateTuition);
router.delete("/:id", verifyToken, verifyTutor, deleteTuition);

// Public single (shesh e)
router.get("/:id", getTuitionById);

export default router;