const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, brand, imageBase64 } = req.body;

    if (!name || !price || !imageBase64) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Upload image to Cloudinary with timeout and optimization settings
    const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
      upload_preset: "agriGrow",
      timeout: 120000, // Increase timeout to 120 seconds
      transformation: [
        { width: 1024, height: 1024, crop: "limit" }, // Limit image size
        { quality: "auto:good" }, // Optimize quality
        { fetch_format: "auto" }, // Auto-select best format
      ],
    });

    // Create product
    const product = await Product.create({
      name,
      price: Number(price),
      description,
      brand,
      imageUrl: uploadResponse.secure_url,
      category: "Other",
      stock: 0,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    // Handle specific Cloudinary errors
    if (error.name === "TimeoutError") {
      return res.status(408).json({
        success: false,
        message: "Image upload timed out. Please try with a smaller image.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
