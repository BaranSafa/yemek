const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    category:    { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    imageUrl:    { type: String, default: '' },
    basePrice:   { type: Number, required: true, min: 0 },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
