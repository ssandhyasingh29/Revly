import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/User.js";

// "protect" runs before any route that requires login (posting a review,
// following someone, etc). It reads the JWT from the Authorization header,
// verifies it, and loads the matching user onto req.user so later
// controllers know who is making the request.
//
// JWTs are stateless (the server never stores a session for them — the
// token itself carries proof of identity, verified using the secret key).
// That's what makes them scale well: no session lookup table to check.
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      res.status(401);
      throw new Error("User belonging to this token no longer exists");
    }
    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized, token invalid or expired");
  }
});
