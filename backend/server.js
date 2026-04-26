require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS — Netlify ve localhost'a izin ver
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS engellendi: ' + origin));
  },
  credentials: true,
}));

app.use(express.json());

// Sağlık kontrolü
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Rotalar
app.use('/api/seed',       require('./routes/seed'));
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/menu-items', require('./routes/menu'));
app.use('/api/products',   require('./routes/products'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/admin',      require('./routes/admin'));

// 404
app.use((req, res) => res.status(404).json({ message: 'Sayfa bulunamadı' }));

// Hata yakalayıcı
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Sunucu hatası' });
});

// Veritabanı bağlantısı + sunucuyu başlat
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ MONGODB_URI tanımlı değil! .env dosyasını kontrol et.');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB bağlandı');
    app.listen(PORT, () => console.log(`🚀 Sunucu çalışıyor → http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB bağlantı hatası:', err.message);
    process.exit(1);
  });
