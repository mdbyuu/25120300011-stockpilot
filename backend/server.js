require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const apiRoutes = require('./routes/api');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for local dev / testing
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request Logging & Body Parsing
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing API
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Warehouse Inventory Management System API is running smoothly.',
    documentation: '/api/health'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} tidak ditemukan pada server.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  const isDbConnectionError =
    err.name === 'SequelizeConnectionRefusedError' ||
    err.name === 'SequelizeConnectionError' ||
    (err.message && err.message.includes('ECONNREFUSED'));

  const userMessage = isDbConnectionError
    ? 'Basis data MySQL belum aktif atau tidak dapat dijangkau (ECONNREFUSED: 3306). Silakan buka XAMPP Control Panel lalu klik Start pada MySQL.'
    : (err.message || 'Terjadi kesalahan internal server.');

  res.status(err.status || 500).json({
    success: false,
    message: userMessage,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Database Connection & Server Initialization
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Koneksi basis data MySQL berhasil terhubung.');

    app.listen(PORT, () => {
      console.log(`🚀 Server Backend berjalan aktif pada port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.warn('⚠️ Tidak dapat terhubung langsung ke MySQL:', error.message);
    console.warn('💡 SOLUSI: Pastikan XAMPP sudah dibuka dan service MySQL sudah di-klik "Start".');
    console.warn('⚠️ Catatan: Request API yang membutuhkan basis data akan mengembalikan Error 500 jika MySQL belum aktif.');
    console.log(`ℹ️ Menjalankan server Express secara mandiri pada http://localhost:${PORT} (Mode Standalone)`);
    app.listen(PORT, () => {
      console.log(`🚀 Server Backend aktif pada port http://localhost:${PORT} (Mode Standalone)`);
    });
  }
};

startServer();

module.exports = app;
