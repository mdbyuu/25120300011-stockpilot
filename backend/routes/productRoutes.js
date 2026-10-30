const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validate } = require('../middlewares/validatorMiddleware');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.use(authenticate);

// Staff dan Admin dapat melihat daftar dan detail produk
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Tambah & Edit Produk dapat dilakukan oleh Admin dan Staff Gudang
router.post('/', authorize(['admin', 'staff']), validate(productController.productValidation), productController.createProduct);
router.put('/:id', authorize(['admin', 'staff']), validate(productController.productValidation), productController.updateProduct);

// Hapus Produk hanya boleh dilakukan oleh Admin
router.delete('/:id', authorize(['admin']), productController.deleteProduct);

module.exports = router;
