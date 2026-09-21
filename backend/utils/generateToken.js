import jwt from "jsonwebtoken";

// Creates a signed JWT containing just the user's id.
// Anything else the frontend needs (name, avatar...) should be fetched
// via /api/auth/me, not stuffed into the token — tokens are visible
// to anyone who has them, so keep them small and non-sensitive.
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export default generateToken;
