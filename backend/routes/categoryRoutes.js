const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { validate } = require('../middlewares/validatorMiddleware');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.use(authenticate);

// Semua pengguna terautentikasi dapat melihat kategori
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Hanya Admin yang dapat memodifikasi kategori
router.post('/', authorize(['admin']), validate(categoryController.categoryValidation), categoryController.createCategory);
router.put('/:id', authorize(['admin']), validate(categoryController.categoryValidation), categoryController.updateCategory);
router.delete('/:id', authorize(['admin']), categoryController.deleteCategory);

module.exports = router;
