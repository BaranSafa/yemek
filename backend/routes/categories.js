const router = require('express').Router();
const Category = require('../models/Category');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /categories — herkese açık
router.get('/', async (req, res) => {
  try {
    const cats = await Category.find().sort({ name: 1 });
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /categories — sadece admin
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json(cat);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Bu kategori adı zaten var' });
    res.status(500).json({ message: err.message });
  }
});

// PATCH /categories/:id — sadece admin
router.patch('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cat) return res.status(404).json({ message: 'Kategori bulunamadı' });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /categories/:id — sadece admin
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Silindi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
