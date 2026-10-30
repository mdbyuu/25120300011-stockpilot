const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { validate } = require('../middlewares/validatorMiddleware');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

// Riwayat mutasi stok
router.get('/', transactionController.getTransactions);

// Catat mutasi stok baru (IN / OUT / ADJUSTMENT)
router.post('/', validate(transactionController.transactionValidation), transactionController.createTransaction);

module.exports = router;
