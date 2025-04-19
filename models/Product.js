const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide product description']
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price']
  },
  imageUrl: {
    type: String,
    required: [true, 'Please provide product image URL']
  },
  category: {
    type: String,
    required: [true, 'Please provide product category'],
    enum: ['Fertilizer', 'Seeds', 'Tools', 'Pesticides', 'Other']
  },
  stock: {
    type: Number,
    required: [true, 'Please provide product stock'],
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);