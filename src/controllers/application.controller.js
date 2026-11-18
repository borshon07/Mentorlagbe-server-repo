import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

const applications = () => getDB().collection("applications");
const tuitions = () => getDB().collection("tuitions");
const users = () => getDB().collection("users");

// Unique index: ek student ek tuition e ekbar-i apply korte parbe
export const ensureApplicationIndexes = async () => {
  await applications().createIndex(
    { tuitionId: 1, studentEmail: 1 },
    { unique: true },
  );
};

// STUDENT: apply
export const applyForTuition = async (req, res) => {
  try {
    const { email, name } = req.user;
    const { tuitionId, studentPhone, preferredSchedule, studentNote } =
      req.body;

    if (!tuitionId || !ObjectId.isValid(tuitionId)) {
      return res.status(400).json({ message: "Invalid tuition id" });
    }
    if (!studentPhone || !preferredSchedule) {
      return res
        .status(400)
        .json({ message: "Phone and preferred schedule are required" });
    }

    const tuition = await tuitions().findOne({
      _id: new ObjectId(tuitionId),
      approvalStatus: "approved",
      isActive: true,
    });
    if (!tuition) {
      return res
        .status(404)
        .json({ message: "Tuition not found or not available" });
    }

    const dbStudent = await users().findOne({ email });

    const doc = {
      tuitionId: tuition._id.toString(),
      tuitionTitle: tuition.title,
      subject: tuition.subject,
      monthlyFee: tuition.monthlyFee,
      tutorEmail: tuition.tutorEmail,
      tutorName: tuition.tutorName,
      studentName: name,
      studentEmail: email,
      studentPhone,
      preferredSchedule,
      studentNote: studentNote || "",
      status: "pending",
      studentPlan: dbStudent?.plan === "pro" ? "pro" : "free",
      appliedAt: new Date(),
    };

    const result = await applications().insertOne(doc);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "You have already applied for this tuition" });
    }
    res.status(500).json({ message: "Failed to submit application" });
  }
};

// STUDENT: check if already applied
export const checkApplied = async (req, res) => {
  try {
    const found = await applications().findOne({
      tuitionId: req.params.tuitionId,
      studentEmail: req.user.email,
    });
    res.json({ applied: !!found });
  } catch (error) {
    res.status(500).json({ message: "Failed to check application" });
  }
};

// STUDENT: my applications
export const getMyApplications = async (req, res) => {
  try {
    const data = await applications()
      .find({ studentEmail: req.user.email })
      .sort({ appliedAt: -1 })
      .toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

// STUDENT: cancel (shudhu pending hole)
export const cancelApplication = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid application id" });
    }

    const result = await applications().deleteOne({
      _id: new ObjectId(id),
      studentEmail: req.user.email,
      status: "pending",
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Application not found or can no longer be cancelled",
      });
    }
    res.json({ message: "Application cancelled" });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel application" });
  }
};

// TUTOR: applicants (Pro student age)
export const getApplicants = async (req, res) => {
  try {
    const data = await applications()
      .find({ tutorEmail: req.user.email })
      .sort({ studentPlan: -1, appliedAt: -1 })
      .toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applicants" });
  }
};

// TUTOR: accept / reject
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid application id" });
    }
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const result = await applications().updateOne(
      { _id: new ObjectId(id), tutorEmail: req.user.email },
      { $set: { status } },
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "Application not found or not yours" });
    }
    res.json({ message: `Application ${status}` });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
};