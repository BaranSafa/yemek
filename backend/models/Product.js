const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:               { type: String, required: true, trim: true },
    category:           { type: String, required: true, trim: true },
    description:        { type: String, default: '' },
    imageUrl:           { type: String, default: '' },
    basePrice:          { type: Number, required: true, min: 0 },
    currentPrice:       { type: Number, required: true, min: 0 },
    discountRate:       { type: Number, default: 0 },
    totalPortions:      { type: Number, required: true, min: 1 },
    remainingPortions:  { type: Number, required: true, min: 0 },
    salesDurationHours: { type: Number, required: true, min: 0.5 },
    listedAt:           { type: Date, required: true },
    expiresAt:          { type: Date, required: true },
    isActive:           { type: Boolean, default: true },
    addedBy:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

productSchema.methods.calculateCurrentPrice = function () {
  const now = Date.now();
  const total = this.expiresAt - this.listedAt;
  const remaining = this.expiresAt - now;
  const ratio = remaining / total;

  let discount = 0;
  if (ratio <= 0)        discount = 55;
  else if (ratio < 0.10) discount = 55;
  else if (ratio < 0.20) discount = 40;
  else if (ratio < 0.40) discount = 25;
  else if (ratio < 0.60) discount = 10;
  else                   discount = 0;

  this.discountRate = discount;
  this.currentPrice = parseFloat((this.basePrice * (1 - discount / 100)).toFixed(2));
};

module.exports = mongoose.model('Product', productSchema);
