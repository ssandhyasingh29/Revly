import express from "express";

import {
  getProducts,
  getTrendingProducts,
  getProductById,
  createProduct,
  searchProducts,
} from "../controllers/productController.js";

import { protect } from "../middleware/auth.js";

import upload from "../middleware/upload.js";

const router = express.Router();

// ==========================================
// SEARCH
// ==========================================

router.get(
  "/search",
  searchProducts
);

// ==========================================
// TRENDING
// ==========================================

router.get(
  "/trending",
  getTrendingProducts
);

// ==========================================
// ALL PRODUCTS
// ==========================================

router.get(
  "/",
  getProducts
);

// ==========================================
// SINGLE PRODUCT
// ==========================================

router.get(
  "/:id",
  getProductById
);

// ==========================================
// CREATE PRODUCT
// ==========================================

router.post(
  "/",
  protect,
  upload.single("image"),
  createProduct
);

export default router;