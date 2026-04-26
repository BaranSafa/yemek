const router = require('express').Router();
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /admin/users — tüm kullanıcılar (admin)
router.get('/users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName:  { $regex: req.query.search, $options: 'i' } },
        { phone:     { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /admin/users/:id — kullanıcı sil (admin)
router.delete('/users/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Kendi hesabınızı silemezsiniz' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Kullanıcı silindi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
