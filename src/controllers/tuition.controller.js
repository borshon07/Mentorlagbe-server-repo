import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

const tuitions = () => getDB().collection("tuitions");
const users = () => getDB().collection("users");

// PUBLIC: approved + active tuition, server-side search, filter, pagination
export const getAllTuitions = async (req, res) => {
  try {
    const {
      search,
      subject,
      classLevel,
      mode,
      location,
      page = 1,
      limit = 9,
    } = req.query;
    const query = { approvalStatus: "approved", isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }
    if (location) query.location = { $regex: location, $options: "i" };
    if (subject) query.subject = subject;
    if (classLevel) query.classLevel = classLevel;
    if (mode) query.mode = mode;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 9, 1), 50);

    const total = await tuitions().countDocuments(query);
    const data = await tuitions()
      .find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .toArray();

    res.json({
      data,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tuitions" });
  }
};

// PUBLIC: latest 6 for home page
export const getLatestTuitions = async (req, res) => {
  try {
    const data = await tuitions()
      .find({ approvalStatus: "approved", isActive: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tuitions" });
  }
};

// PUBLIC: single tuition
export const getTuitionById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid tuition id" });
    }
    const tuition = await tuitions().findOne({ _id: new ObjectId(id) });
    if (!tuition) return res.status(404).json({ message: "Tuition not found" });
    res.json(tuition);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tuition" });
  }
};

// TUTOR: create (free plan limit = 2)
export const createTuition = async (req, res) => {
  try {
    const { email, name } = req.user;

    const dbUser = await users().findOne({ email });
    const count = await tuitions().countDocuments({ tutorEmail: email });

    if (dbUser?.plan !== "pro" && count >= 2) {
      return res.status(403).json({
        message:
          "Free plan allows only 2 tuition posts. Upgrade to Pro for unlimited posts.",
      });
    }

    const {
      title,
      subject,
      classLevel,
      mode,
      location,
      monthlyFee,
      daysPerWeek,
      bannerImage,
      description,
    } = req.body;

    if (
      !title ||
      !subject ||
      !classLevel ||
      !mode ||
      !monthlyFee ||
      !description
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const doc = {
      title,
      subject,
      classLevel,
      mode,
      location: location || "",
      monthlyFee: Number(monthlyFee),
      daysPerWeek: Number(daysPerWeek) || 3,
      bannerImage: bannerImage || "",
      description,
      tutorName: name,
      tutorEmail: email,
      approvalStatus: "pending",
      isActive: true,
      createdAt: new Date(),
    };

    const result = await tuitions().insertOne(doc);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: "Failed to create tuition" });
  }
};

// TUTOR: my tuitions
export const getMyTuitions = async (req, res) => {
  try {
    const data = await tuitions()
      .find({ tutorEmail: req.user.email })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your tuitions" });
  }
};

// TUTOR: update own tuition
export const updateTuition = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid tuition id" });
    }

    const allowed = [
      "title",
      "subject",
      "classLevel",
      "mode",
      "location",
      "monthlyFee",
      "daysPerWeek",
      "bannerImage",
      "description",
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (updates.monthlyFee) updates.monthlyFee = Number(updates.monthlyFee);
    if (updates.daysPerWeek) updates.daysPerWeek = Number(updates.daysPerWeek);

    const result = await tuitions().updateOne(
      { _id: new ObjectId(id), tutorEmail: req.user.email },
      { $set: updates },
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "Tuition not found or not yours" });
    }
    res.json({ message: "Tuition updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update tuition" });
  }
};

// TUTOR: toggle active / closed
export const toggleTuitionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid tuition id" });
    }

    const tuition = await tuitions().findOne({
      _id: new ObjectId(id),
      tutorEmail: req.user.email,
    });
    if (!tuition) {
      return res
        .status(404)
        .json({ message: "Tuition not found or not yours" });
    }

    await tuitions().updateOne(
      { _id: tuition._id },
      { $set: { isActive: !tuition.isActive } },
    );
    res.json({ message: "Status updated", isActive: !tuition.isActive });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
};

// TUTOR: delete own tuition
export const deleteTuition = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid tuition id" });
    }

    const result = await tuitions().deleteOne({
      _id: new ObjectId(id),
      tutorEmail: req.user.email,
    });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Tuition not found or not yours" });
    }
    res.json({ message: "Tuition deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete tuition" });
  }
};
