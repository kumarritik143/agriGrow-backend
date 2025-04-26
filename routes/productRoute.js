const express = require("express");
const {
  createProduct,
  getProducts,
  getAdminProducts,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router
  .route("/")
  .get(getProducts) // Public route to get all products
  .post(protect, createProduct); // Protected route to create product

router.route("/admin").get(protect, getAdminProducts); // Fetch admin products
router.route("/:id")
  .put(protect, updateProduct) // Update a product
  .delete(protect, deleteProduct); // Delete a product

module.exports = router;