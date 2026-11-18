import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  getSavedIds,
  getSavedTuitions,
  toggleSaved,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyStudent } from "../middlewares/verifyStudent.js";

const router = express.Router();

router.get("/me", verifyToken, getMyProfile);
router.patch("/me", verifyToken, updateMyProfile);

// Student bookmarks
router.get("/saved/ids", verifyToken, verifyStudent, getSavedIds);
router.get("/saved", verifyToken, verifyStudent, getSavedTuitions);
router.post("/saved/:tuitionId", verifyToken, verifyStudent, toggleSaved);

export default router;