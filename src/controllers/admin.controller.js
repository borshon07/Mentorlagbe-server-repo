import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

const users = () => getDB().collection("users");
const tuitions = () => getDB().collection("tuitions");
const payments = () => getDB().collection("payments");

// ADMIN: platform stats
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalTutors,
      totalStudents,
      pendingTuitions,
      approvedTuitions,
      revenueAgg,
    ] = await Promise.all([
      users().countDocuments(),
      users().countDocuments({ role: "tutor" }),
      users().countDocuments({ role: "student" }),
      tuitions().countDocuments({ approvalStatus: "pending" }),
      tuitions().countDocuments({ approvalStatus: "approved" }),
      payments()
        .aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }])
        .toArray(),
    ]);

    res.json({
      totalUsers,
      totalTutors,
      totalStudents,
      pendingTuitions,
      approvedTuitions,
      totalRevenue: revenueAgg[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

// ADMIN: all users
export const getAllUsers = async (req, res) => {
  try {
    const data = await users().find().sort({ createdAt: -1 }).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// ADMIN: change role
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    if (!["student", "tutor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const target = await users().findOne({ _id: new ObjectId(id) });
    if (!target) return res.status(404).json({ message: "User not found" });

    // Admin nijer role nijei change kore nijeke lockout korte parbe na
    if (target.email === "admin@mentorlagbe.com") {
      return res
        .status(400)
        .json({ message: "Primary admin cannot be changed" });
    }

    await users().updateOne({ _id: target._id }, { $set: { role } });
    res.json({ message: "Role updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update role" });
  }
};

// ADMIN: all tuitions (pending, approved, rejected shob)
export const getAllTuitionsAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (["pending", "approved", "rejected"].includes(status)) {
      query.approvalStatus = status;
    }
    const data = await tuitions().find(query).sort({ createdAt: -1 }).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tuitions" });
  }
};

// ADMIN: approve / reject
export const updateApprovalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid tuition id" });
    }
    if (!["approved", "rejected"].includes(approvalStatus)) {
      return res.status(400).json({ message: "Invalid approval status" });
    }

    const result = await tuitions().updateOne(
      { _id: new ObjectId(id) },
      { $set: { approvalStatus } },
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Tuition not found" });
    }
    res.json({ message: `Tuition ${approvalStatus}` });
  } catch (error) {
    res.status(500).json({ message: "Failed to update approval status" });
  }
};

// ADMIN: all payments
export const getAllPayments = async (req, res) => {
  try {
    const data = await payments().find().sort({ paidAt: -1 }).toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};
