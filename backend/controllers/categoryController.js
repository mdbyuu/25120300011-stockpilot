const { body } = require('express-validator');
const { Category, Product } = require('../models');

const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Nama kategori wajib diisi.').isLength({ max: 100 }).escape(),
  body('code').trim().notEmpty().withMessage('Kode kategori wajib diisi.').isLength({ max: 20 }).toUpperCase().escape(),
  body('description').optional().trim().escape()
];

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Product, as: 'products', attributes: ['id'] }],
      order: [['name', 'ASC']]
    });

    const formatted = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      code: cat.code,
      description: cat.description,
      product_count: cat.products ? cat.products.length : 0,
      created_at: cat.created_at
    }));

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kategori.',
      error: error.message
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Product, as: 'products' }]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan.'
      });
    }

    return res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail kategori.',
      error: error.message
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    const existingCode = await Category.findOne({ where: { code } });
    if (existingCode) {
      return res.status(409).json({
        success: false,
        message: `Kode kategori '${code}' sudah digunakan.`
      });
    }

    const category = await Category.create({ name, code, description });

    return res.status(201).json({
      success: true,
      message: 'Kategori berhasil ditambahkan.',
      data: category
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan kategori.',
      error: error.message
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan.'
      });
    }

    if (code && code !== category.code) {
      const existingCode = await Category.findOne({ where: { code } });
      if (existingCode) {
        return res.status(409).json({
          success: false,
          message: `Kode kategori '${code}' sudah digunakan oleh kategori lain.`
        });
      }
    }

    await category.update({ name, code, description });

    return res.status(200).json({
      success: true,
      message: 'Kategori berhasil diperbarui.',
      data: category
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui kategori.',
      error: error.message
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [{ model: Product, as: 'products' }]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan.'
      });
    }

    if (category.products && category.products.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Kategori tidak dapat dihapus karena masih menaungi ${category.products.length} produk aktif.`
      });
    }

    await category.destroy();

    return res.status(200).json({
      success: true,
      message: 'Kategori berhasil dihapus.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus kategori.',
      error: error.message
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  categoryValidation
};
