const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token autentikasi tidak ditemukan.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_warehouse_jwt_key_2026_cakrawala_uas');
    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Sesi tidak valid. Pengguna tidak ditemukan.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token kedaluwarsa atau tidak valid.',
      error: error.message
    });
  }
};

module.exports = { authenticate };
