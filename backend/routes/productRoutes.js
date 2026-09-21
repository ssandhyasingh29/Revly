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



router.get(
  "/search",
  searchProducts
);


router.get(
  "/trending",
  getTrendingProducts
);



router.get(
  "/",
  getProducts
);


router.get(
  "/:id",
  getProductById
);



router.post(
  "/",
  protect,
  upload.single("image"),
  createProduct
);

export default router;
