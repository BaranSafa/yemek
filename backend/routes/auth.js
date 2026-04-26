const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');

function signToken(user) {
  return jwt.sign(
    { _id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /auth/register — müşteri kaydı
router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('Ad gerekli'),
    body('lastName').trim().notEmpty().withMessage('Soyad gerekli'),
    body('phone').trim().notEmpty().withMessage('Telefon gerekli'),
    body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const exists = await User.findOne({ phone: req.body.phone });
      if (exists) return res.status(409).json({ message: 'Bu telefon numarası zaten kayıtlı' });

      const user = await User.create({ ...req.body, role: 'customer' });
      const token = signToken(user);
      res.status(201).json({ token, user: user.toPublic() });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// POST /auth/login — müşteri girişi (sadece customer)
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(401).json({ message: 'Telefon veya şifre hatalı' });
    if (user.role !== 'customer') return res.status(403).json({ message: 'Bu giriş müşteriler içindir' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Telefon veya şifre hatalı' });

    const token = signToken(user);
    res.json({ token, user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /auth/employee-login — çalışan/admin girişi
router.post('/employee-login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(401).json({ message: 'Telefon veya şifre hatalı' });
    if (user.role === 'customer') return res.status(403).json({ message: 'Bu giriş yalnızca personel içindir' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Telefon veya şifre hatalı' });

    const token = signToken(user);
    res.json({ token, user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /auth/create-employee — admin çalışan oluşturur
router.post(
  '/create-employee',
  verifyToken,
  requireRole('admin'),
  [
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('phone').trim().notEmpty(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['employee', 'admin']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const exists = await User.findOne({ phone: req.body.phone });
      if (exists) return res.status(409).json({ message: 'Bu telefon numarası zaten kayıtlı' });

      const user = await User.create(req.body);
      res.status(201).json({ user: user.toPublic() });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// GET /auth/me — mevcut kullanıcı bilgisi
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    res.json(user.toPublic());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /auth/me — profil güncelle
router.patch('/me', verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, password } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

    if (firstName) user.firstName = firstName;
    if (lastName)  user.lastName  = lastName;
    if (password && password.length >= 6) user.password = password;

    await user.save();
    res.json(user.toPublic());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
