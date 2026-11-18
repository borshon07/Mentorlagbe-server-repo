import express from "express";
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  getAllTuitionsAdmin,
  updateApprovalStatus,
  getAllPayments,
} from "../controllers/admin.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.use(verifyToken, verifyAdmin);

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.get("/tuitions", getAllTuitionsAdmin);
router.patch("/tuitions/:id/status", updateApprovalStatus);
router.get("/payments", getAllPayments);

export default router;