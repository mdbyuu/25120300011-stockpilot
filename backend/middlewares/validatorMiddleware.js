const { validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    try {
      await Promise.all(validations.map((validation) => validation.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      return res.status(422).json({
        success: false,
        message: 'Validasi input gagal.',
        errors: errors.array().map(err => ({
          field: err.path || err.param,
          message: err.msg
        }))
      });
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { validate };
