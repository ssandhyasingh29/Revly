import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const optionalProtect = async (
  req,
  res,
  next
) => {
  const authHeader =
    req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = await User.findById(
      decoded.id
    ).select("-password");

    if (!req.user) {
      req.user = null;
    }
  } catch (error) {
    req.user = null;
  }

  next();
};