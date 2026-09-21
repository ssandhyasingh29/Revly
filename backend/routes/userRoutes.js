import express from "express";
import {
  getUsers,
  getUserProfile,
  updateUserProfile,
  updateProfileAvatar,
  followUser,
  unfollowUser,
  getSuggestedUsers,
  getTopReviewers,
  removeProfileAvatar,
} from "../controllers/userController.js";

import { protect } from "../middleware/auth.js";
import { optionalProtect } from "../middleware/optionalProtect.js";
import upload from "../middleware/upload.js";

const router = express.Router();



router.get( "/suggested",optionalProtect,getSuggestedUsers);
router.get("/top-reviewers", getTopReviewers);
router.get("/", getUsers);
router.get("/:id", getUserProfile);


router.put("/:id/avatar",protect,upload.single("avatar"), updateProfileAvatar);

router.put("/:id", protect, updateUserProfile);

router.post("/:id/follow", protect, followUser);
router.delete("/:id/follow", protect, unfollowUser);

router.delete( "/:id/avatar",protect,removeProfileAvatar);

export default router;
