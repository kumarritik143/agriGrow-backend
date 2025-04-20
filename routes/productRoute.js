const express = require("express");
const { createProduct } = require("../controllers/productController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router
  .route("/")

  .post(protect, createProduct);

module.exports = router;
