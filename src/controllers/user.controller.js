import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

const users = () => getDB().collection("users");

// STUDENT: saved tuition id list
export const getSavedIds = async (req, res) => {
  try {
    const user = await users().findOne({ email: req.user.email });
    res.json(user?.savedTuitions || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch saved tuitions" });
  }
};

// STUDENT: saved tuitions (full data)
export const getSavedTuitions = async (req, res) => {
  try {
    const user = await users().findOne({ email: req.user.email });
    const ids = (user?.savedTuitions || [])
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));

    const data = await getDB()
      .collection("tuitions")
      .find({ _id: { $in: ids }, approvalStatus: "approved", isActive: true })
      .toArray();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch saved tuitions" });
  }
};

// STUDENT: toggle save / unsave
export const toggleSaved = async (req, res) => {
  try {
    const { tuitionId } = req.params;
    if (!ObjectId.isValid(tuitionId)) {
      return res.status(400).json({ message: "Invalid tuition id" });
    }

    const user = await users().findOne({ email: req.user.email });
    const saved = user?.savedTuitions || [];
    const isSaved = saved.includes(tuitionId);

    await users().updateOne(
      { email: req.user.email },
      isSaved
        ? { $pull: { savedTuitions: tuitionId } }
        : { $addToSet: { savedTuitions: tuitionId } }
    );
    res.json({ saved: !isSaved });
  } catch (error) {
    res.status(500).json({ message: "Failed to update saved tuitions" });
  }
};
// GET: My Profile
export const getMyProfile = async (req, res) => {
  try {
    const user = await users().findOne(
      { email: req.user.email },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};

// PATCH: Update My Profile
export const updateMyProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "photoURL",
      "phone",
      "address",
      "bio",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided",
      });
    }

    await users().updateOne(
      { email: req.user.email },
      { $set: updateData }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update profile",
    });
  }
};