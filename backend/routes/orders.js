const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { verifyToken, requireRole } = require('../middleware/auth');

function generateCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// POST /orders — sipariş oluştur (müşteri)
router.post('/', verifyToken, requireRole('customer'), async (req, res) => {
  try {
    const { items, paymentInfo } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Sepet boş' });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const { productId, quantity } of items) {
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        return res.status(400).json({ message: `Ürün bulunamadı: ${productId}` });
      }
      if (product.remainingPortions < quantity) {
        return res.status(400).json({ message: `${product.name} için yeterli porsiyon yok` });
      }

      product.calculateCurrentPrice();
      const unitPrice = product.currentPrice;
      const itemTotal = parseFloat((unitPrice * quantity).toFixed(2));

      orderItems.push({
        productId: product._id,
        productName: product.name,
        quantity,
        unitPrice,
        totalPrice: itemTotal,
      });

      product.remainingPortions -= quantity;
      if (product.remainingPortions === 0) product.isActive = false;
      await product.save();

      totalAmount += itemTotal;
    }

    // Benzersiz teslimat kodu oluştur
    let deliveryCode;
    let attempts = 0;
    do {
      deliveryCode = generateCode();
      attempts++;
    } while (attempts < 10 && await Order.findOne({ deliveryCode, status: 'Bekliyor' }));

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      deliveryCode,
      paymentInfo: paymentInfo || {},
    });

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /orders/my — kendi siparişlerim (müşteri)
router.get('/my', verifyToken, requireRole('customer'), async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /orders/stats — istatistikler (çalışan/admin)
router.get('/stats', verifyToken, requireRole('employee', 'admin'), async (req, res) => {
  try {
    const [total, pending, delivered, revenue] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'Bekliyor' }),
      Order.countDocuments({ status: 'Teslim Edildi' }),
      Order.aggregate([
        { $match: { status: 'Teslim Edildi' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    res.json({
      totalOrders: total,
      pendingOrders: pending,
      deliveredOrders: delivered,
      totalRevenue: revenue[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /orders — tüm siparişler (çalışan/admin)
router.get('/', verifyToken, requireRole('employee', 'admin'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName phone')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /orders/deliver/:code — teslimat kodu ile teslim et (çalışan/admin)
router.post('/deliver/:code', verifyToken, requireRole('employee', 'admin'), async (req, res) => {
  try {
    const order = await Order.findOne({ deliveryCode: req.params.code, status: 'Bekliyor' });
    if (!order) return res.status(404).json({ message: 'Aktif sipariş bulunamadı' });

    order.status = 'Teslim Edildi';
    order.deliveredAt = new Date();
    order.deliveredBy = req.user._id;
    await order.save();

    res.json({ message: 'Sipariş teslim edildi', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
