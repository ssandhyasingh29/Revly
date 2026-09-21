import express from "express";
import {
  createReview,
  getReviewsForProduct,
  getReviewsByUser,
  getTopReview,
  getAllReviews,
  toggleLikeReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/top", getTopReview);
router.get("/", getAllReviews);
router.get("/product/:productId", getReviewsForProduct);
router.get("/user/:userId", getReviewsByUser);

router.post("/", protect, createReview);

router.post("/:id/like", protect, toggleLikeReview);
router.delete("/:id", protect, deleteReview);


export default router;
