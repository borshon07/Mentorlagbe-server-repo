import jwt from "jsonwebtoken";
import { getDB } from "../config/db.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: token missing" });
  }

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    const dbUser = await getDB()
      .collection("users")
      .findOne({ email: decoded.email }, { projection: { role: 1, name: 1 } });

    if (!dbUser) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    req.user = { ...decoded, role: dbUser.role, name: dbUser.name };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: invalid or expired token" });
  }
};