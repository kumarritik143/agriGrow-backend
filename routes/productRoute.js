const express = require("express");
const {
  createProduct,
  getProducts,
} = require("../controllers/productController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router
  .route("/")
  .get(getProducts) // Public route to get all products
  .post(protect, createProduct); // Protected route to create product

module.exports = router;