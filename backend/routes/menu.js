const router = require('express').Router();
const MenuItem = require('../models/MenuItem');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /menu-items — tüm menü öğeleri (çalışan+ görebilir)
router.get('/', verifyToken, requireRole('employee', 'admin'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /menu-items — yeni menü öğesi (admin)
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const item = await MenuItem.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /menu-items/:id — güncelle (admin)
router.patch('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Menü öğesi bulunamadı' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /menu-items/:id — sil (admin)
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Silindi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
