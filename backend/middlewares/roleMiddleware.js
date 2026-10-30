const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Informasi peran pengguna tidak ditemukan.'
      });
    }

    const userRole = req.user.role.name.toLowerCase();
    const normalizedRoles = allowedRoles.map(r => r.toLowerCase());

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Akses terlarang. Diperlukan peran [${allowedRoles.join(', ')}], peran Anda saat ini: ${req.user.role.name}.`
      });
    }

    next();
  };
};

module.exports = { authorize };
