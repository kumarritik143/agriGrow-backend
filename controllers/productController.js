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
      addedBy: req.user._id
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

// Fetch products added by the logged-in admin
exports.getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find({ addedBy: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get admin products error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, brand, imageBase64 } = req.body;

    const product = await Product.findOne({ _id: id, addedBy: req.user._id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or not authorized to update",
      });
    }

    // If a new image is provided, upload it to Cloudinary
    if (imageBase64) {
      const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
        upload_preset: "agriGrow",
      });
      product.imageUrl = uploadResponse.secure_url;
    }

    // Update product fields
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.brand = brand || product.brand;

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product and verify it belongs to the admin
    const product = await Product.findOne({ _id: id, addedBy: req.user._id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or not authorized to delete"
      });
    }

    // Delete the product
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};