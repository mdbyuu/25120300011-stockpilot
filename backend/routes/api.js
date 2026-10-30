const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const transactionRoutes = require('./transactionRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const { sequelize } = require('../models');

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/transactions', transactionRoutes);
router.use('/dashboard', dashboardRoutes);

router.get('/health', async (req, res) => {
  let dbStatus = 'connected';
  let dbError = null;

  try {
    await sequelize.authenticate();
  } catch (err) {
    dbStatus = 'disconnected';
    dbError = err.message;
  }

  res.status(dbStatus === 'connected' ? 200 : 503).json({
    status: dbStatus === 'connected' ? 'online' : 'degraded',
    database: {
      status: dbStatus,
      error: dbError ? `${dbError} (Pastikan MySQL di XAMPP sudah di-start)` : null
    },
    timestamp: new Date().toISOString(),
    service: 'Warehouse Inventory Management System API'
  });
});

module.exports = router;
