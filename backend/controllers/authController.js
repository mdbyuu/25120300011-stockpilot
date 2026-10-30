const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { User, Role } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role ? user.role.name : 'staff' },
    process.env.JWT_SECRET || 'super_secret_warehouse_jwt_key_2026_cakrawala_uas',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Nama lengkap wajib diisi.').isLength({ max: 100 }).escape(),
  body('email').trim().isEmail().withMessage('Format email tidak valid.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter.'),
  body('role_id').optional().isInt().withMessage('Role ID harus berupa angka.')
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Email wajib diisi dengan format yang benar.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password wajib diisi.')
];

const register = async (req, res) => {
  try {
    const { name, email, password, role_id } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.'
      });
    }

    // Default ke role Staff jika tidak disediakan atau role_id tidak valid
    let assignedRoleId = role_id;
    if (!assignedRoleId) {
      const staffRole = await Role.findOne({ where: { name: 'staff' } });
      assignedRoleId = staffRole ? staffRole.id : 2;
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role_id: assignedRoleId
    });

    const userWithRole = await User.findByPk(newUser.id, {
      include: [{ model: Role, as: 'role', attributes: ['id', 'name', 'description'] }],
      attributes: { exclude: ['password'] }
    });

    const token = generateToken(userWithRole);

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil.',
      data: {
        user: userWithRole,
        token
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat registrasi.',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role', attributes: ['id', 'name', 'description'] }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Kombinasi email atau password salah.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Kombinasi email atau password salah.'
      });
    }

    const token = generateToken(user);
    const userSafe = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role ? user.role.name : 'staff',
      role_description: user.role ? user.role.description : ''
    };

    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      data: {
        user: userSafe,
        token
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat login.',
      error: error.message
    });
  }
};

const getProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role ? req.user.role.name : 'staff',
      role_description: req.user.role ? req.user.role.description : ''
    }
  });
};

module.exports = {
  register,
  login,
  getProfile,
  registerValidation,
  loginValidation
};
