const Order   = require('../models/Order');
const Product = require('../models/Product');

const EXPIRE_MS = 60 * 60 * 1000; // 60 dakika

async function cancelExpiredOrders() {
  try {
    const cutoff  = new Date(Date.now() - EXPIRE_MS);
    const expired = await Order.find({ status: 'Bekliyor', createdAt: { $lt: cutoff } });

    for (const order of expired) {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.remainingPortions += item.quantity;
          product.isActive = true;
          await product.save();
        }
      }
      order.status = 'İptal';
      await order.save();
      console.log(`⏰ Otomatik iptal: sipariş ${order._id}`);
    }
  } catch (err) {
    console.error('autoCancel hatası:', err.message);
  }
}

function startAutoCancel() {
  cancelExpiredOrders();
  setInterval(cancelExpiredOrders, 60 * 1000);
  console.log('⏰ Otomatik iptal job başlatıldı (60 sn aralık)');
}

module.exports = { startAutoCancel };
