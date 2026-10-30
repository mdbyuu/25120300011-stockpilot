const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middlewares/validatorMiddleware');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/register', validate(authController.registerValidation), authController.register);
router.post('/login', validate(authController.loginValidation), authController.login);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
