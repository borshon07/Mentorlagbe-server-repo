import express from "express";
import {
  applyForTuition,
  checkApplied,
  getMyApplications,
  cancelApplication,
  getApplicants,
  updateApplicationStatus,
} from "../controllers/application.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyStudent } from "../middlewares/verifyStudent.js";
import { verifyTutor } from "../middlewares/verifyTutor.js";

const router = express.Router();

// Student
router.post("/", verifyToken, verifyStudent, applyForTuition);
router.get("/my", verifyToken, verifyStudent, getMyApplications);
router.get("/check/:tuitionId", verifyToken, verifyStudent, checkApplied);
router.get("/reviews/:tuitionId", getTuitionReviews);
router.patch("/:id/review", verifyToken, verifyStudent, submitReview);
router.delete("/:id", verifyToken, verifyStudent, cancelApplication);

// Tutor
router.get("/applicants", verifyToken, verifyTutor, getApplicants);
router.patch("/:id/status", verifyToken, verifyTutor, updateApplicationStatus);

export default router;