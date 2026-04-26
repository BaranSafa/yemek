const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:              { type: String, required: true, trim: true },
    category:          { type: String, required: true, trim: true },
    description:       { type: String, default: '' },
    imageUrl:          { type: String, default: '' },
    basePrice:         { type: Number, required: true, min: 0 },
    currentPrice:      { type: Number, required: true, min: 0 },
    discountRate:      { type: Number, default: 0 },
    totalPortions:     { type: Number, required: true, min: 1 },
    remainingPortions: { type: Number, required: true, min: 0 },
    listedAt:          { type: Date, required: true },
    expiresAt:         { type: Date, required: true },
    isActive:          { type: Boolean, default: true },
    addedBy:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    menuItemId:        { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  },
  { timestamps: true }
);

// Discount based on hours remaining until expiresAt (22:00)
productSchema.methods.calculateCurrentPrice = function () {
  const now = new Date();
  const closeAt = this.expiresAt;

  if (!closeAt || now >= closeAt) {
    this.discountRate = 55;
    this.currentPrice = parseFloat((this.basePrice * 0.45).toFixed(2));
    return;
  }

  const hoursLeft = (closeAt - now) / 3600000;

  let discount;
  if (hoursLeft > 6)      discount = 0;
  else if (hoursLeft > 4) discount = 10;
  else if (hoursLeft > 2) discount = 25;
  else if (hoursLeft > 1) discount = 40;
  else                    discount = 55;

  this.discountRate = discount;
  this.currentPrice = parseFloat((this.basePrice * (1 - discount / 100)).toFixed(2));
};

module.exports = mongoose.model('Product', productSchema);
