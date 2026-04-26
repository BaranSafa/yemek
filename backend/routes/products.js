const router = require('express').Router();
const Product = require('../models/Product');
const { verifyToken, requireRole } = require('../middleware/auth');

function refreshPrices(products) {
  products.forEach((p) => p.calculateCurrentPrice());
}

// GET /products — aktif ürünler, güncel fiyatlarla (herkese açık)
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const filter = { isActive: true, expiresAt: { $gt: now }, remainingPortions: { $gt: 0 } };
    if (req.query.category) filter.category = req.query.category;

    const products = await Product.find(filter).sort({ expiresAt: 1 });
    refreshPrices(products);

    // Fiyat değişikliği varsa toplu kaydet
    await Promise.all(products.map((p) => p.save()));

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /products/admin — tüm ürünler (çalışan/admin)
router.get('/admin', verifyToken, requireRole('employee', 'admin'), async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    refreshPrices(products);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /products — yeni ürün (çalışan/admin)
router.post('/', verifyToken, requireRole('employee', 'admin'), async (req, res) => {
  try {
    const { name, category, description, imageUrl, basePrice, totalPortions, salesDurationHours } = req.body;
    const listedAt = new Date();
    const expiresAt = new Date(listedAt.getTime() + salesDurationHours * 3600000);

    const product = new Product({
      name, category, description, imageUrl,
      basePrice, currentPrice: basePrice,
      totalPortions, remainingPortions: totalPortions,
      salesDurationHours, listedAt, expiresAt,
      addedBy: req.user._id,
    });

    product.calculateCurrentPrice();
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /products/:id — güncelle (çalışan/admin)
router.patch('/:id', verifyToken, requireRole('employee', 'admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Ürün bulunamadı' });
    product.calculateCurrentPrice();
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /products/:id — sil (çalışan/admin)
router.delete('/:id', verifyToken, requireRole('employee', 'admin'), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ürün silindi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
