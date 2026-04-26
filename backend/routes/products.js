const router = require('express').Router();
const Product = require('../models/Product');
const MenuItem = require('../models/MenuItem');
const { verifyToken, requireRole } = require('../middleware/auth');

function refreshPrices(products) {
  products.forEach((p) => p.calculateCurrentPrice());
}

// GET /products — bugün aktif listeler, güncel fiyatlarla (herkese açık)
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const filter = { isActive: true, expiresAt: { $gt: now }, remainingPortions: { $gt: 0 } };
    if (req.query.category) filter.category = req.query.category;

    const products = await Product.find(filter).sort({ expiresAt: 1 });
    refreshPrices(products);
    await Promise.all(products.map((p) => p.save()));

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /products/admin — tüm listeler (çalışan/admin)
router.get('/admin', verifyToken, requireRole('employee', 'admin'), async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    refreshPrices(products);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /products — çalışan menü öğesinden günlük listeleme oluşturur
router.post('/', verifyToken, requireRole('employee', 'admin'), async (req, res) => {
  try {
    const { menuItemId, totalPortions } = req.body;
    if (!menuItemId || !totalPortions) {
      return res.status(400).json({ message: 'menuItemId ve totalPortions gerekli' });
    }

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) return res.status(404).json({ message: 'Menü öğesi bulunamadı' });

    // Kapanış saati: bugün 22:00
    const closeAt = new Date();
    closeAt.setHours(22, 0, 0, 0);

    if (new Date() >= closeAt) {
      return res.status(400).json({ message: "Bugünkü satış saati sona erdi (22:00). Yarın tekrar deneyin." });
    }

    const product = new Product({
      name:              menuItem.name,
      category:          menuItem.category,
      description:       menuItem.description,
      imageUrl:          menuItem.imageUrl,
      basePrice:         menuItem.basePrice,
      currentPrice:      menuItem.basePrice,
      menuItemId:        menuItem._id,
      totalPortions:     Number(totalPortions),
      remainingPortions: Number(totalPortions),
      listedAt:          new Date(),
      expiresAt:         closeAt,
      addedBy:           req.user._id,
    });

    product.calculateCurrentPrice();
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /products/:id — stok düzelt / yayından kaldır (çalışan/admin)
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
