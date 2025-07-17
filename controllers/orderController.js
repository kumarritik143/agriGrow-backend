const Order = require('../models/Order');
const Product = require('../models/Product');

// Place a new order
exports.placeOrder = async (req, res) => {
  try {
    const { products, total, address } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: 'No products in order' });
    }
    if (!address) {
      return res.status(400).json({ success: false, message: 'No address provided' });
    }
    // Optionally, fetch product details for each product
    const productDetails = await Promise.all(products.map(async (item) => {
      const prod = await Product.findById(item.product);
      return {
        product: prod._id,
        quantity: item.quantity,
        name: prod.name,
        price: prod.price,
        imageUrl: prod.imageUrl,
        brand: prod.brand,
      };
    }));
    const order = await Order.create({
      user: req.user._id,
      products: productDetails,
      total,
      address,
    });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all orders for the logged-in user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}; 