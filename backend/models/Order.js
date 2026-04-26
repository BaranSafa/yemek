const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String, required: true },
    quantity:    { type: Number, required: true, min: 1 },
    unitPrice:   { type: Number, required: true },
    totalPrice:  { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items:       [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status:      { type: String, enum: ['Bekliyor', 'Teslim Edildi', 'İptal'], default: 'Bekliyor' },
    deliveryCode: { type: String, required: true },
    paymentInfo: {
      cardLastFour: { type: String, default: '' },
    },
    deliveredAt: { type: Date },
    deliveredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
