const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['Vegetables', 'Fruits', 'Grains & Pulses', 'Dairy & Organic', 'Herbs & Spices'],
    default: 'Vegetables'
  },
  price: { type: Number, required: true, min: 0 },
  unit: { type: String, default: 'kg' },
  stock: { type: Number, default: 10, min: 0 },
  image: { type: String, default: '' },
  farmerName: { type: String, required: true, default: 'Local Organic Farmer' },
  farmLocation: { type: String, default: 'Erode, Tamil Nadu' },
  rating: { type: Number, default: 4.8 },
  isOrganic: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
