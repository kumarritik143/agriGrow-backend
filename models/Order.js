const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: { type: Number, required: true },
      name: String,
      price: Number,
      imageUrl: String,
      brand: String,
    },
  ],
  total: { type: Number, required: true },
  address: {
    name: String,
    phone: String,
    pincode: String,
    state: String,
    city: String,
    houseNumber: String,
    village: String,
    areaName: String,
    nearby: String,
  },
  status: { type: String, default: 'Placed' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema); 