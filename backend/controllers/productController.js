const { body } = require('express-validator');
const { Op } = require('sequelize');
const { Product, Category, InventoryTransaction } = require('../models');

const productValidation = [
  body('name').trim().notEmpty().withMessage('Nama produk wajib diisi.').isLength({ max: 150 }).escape(),
  body('category_id').isInt().withMessage('Kategori harus dipilih dan berupa angka valid.'),
  body('sku').trim().notEmpty().withMessage('Kode SKU produk wajib diisi.').isLength({ max: 50 }).toUpperCase().escape(),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stok awal minimal 0.'),
  body('min_stock').optional().isInt({ min: 0 }).withMessage('Batas minimum stok minimal 0.'),
  body('price').isFloat({ min: 0 }).withMessage('Harga produk minimal 0.'),
  body('unit').trim().notEmpty().withMessage('Satuan unit wajib diisi (misal: pcs, box, dus).').escape(),
  body('location').optional().trim().escape()
];

const getProducts = async (req, res) => {
  try {
    const { search, category_id, low_stock } = req.query;

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } }
      ];
    }

    if (category_id) {
      whereClause.category_id = category_id;
    }

    const products = await Product.findAll({
      where: whereClause,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'code'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    let filtered = products;
    if (low_stock === 'true') {
      filtered = products.filter(p => p.stock <= p.min_stock);
    }

    return res.status(200).json({
      success: true,
      total: filtered.length,
      data: filtered
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar produk.',
      error: error.message
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'code'] },
        {
          model: InventoryTransaction,
          as: 'transactions',
          limit: 10,
          order: [['transaction_date', 'DESC']]
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan.'
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail produk.',
      error: error.message
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { category_id, sku, name, stock = 0, min_stock = 5, price, unit = 'pcs', location = 'Rak Gudang A' } = req.body;

    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori yang dipilih tidak valid atau tidak ditemukan.'
      });
    }

    const existingSku = await Product.findOne({ where: { sku } });
    if (existingSku) {
      return res.status(409).json({
        success: false,
        message: `SKU '${sku}' sudah digunakan oleh produk lain.`
      });
    }

    const newProduct = await Product.create({
      category_id,
      sku,
      name,
      stock,
      min_stock,
      price,
      unit,
      location
    });

    // Jika ada stok awal, catat audit log transaksi otomatis
    if (Number(stock) > 0) {
      const refNo = `INIT-${newProduct.id}-${Date.now().toString().slice(-4)}`;
      await InventoryTransaction.create({
        reference_no: refNo,
        product_id: newProduct.id,
        user_id: req.user.id,
        type: 'IN',
        quantity: Number(stock),
        previous_stock: 0,
        current_stock: Number(stock),
        note: 'Pencatatan saldo stok awal produk baru',
        transaction_date: new Date()
      });
    }

    const result = await Product.findByPk(newProduct.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'code'] }]
    });

    return res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan.',
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan produk.',
      error: error.message
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, sku, name, min_stock, price, unit, location } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan.'
      });
    }

    if (category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Kategori yang dipilih tidak ditemukan.'
        });
      }
    }

    if (sku && sku !== product.sku) {
      const existingSku = await Product.findOne({ where: { sku } });
      if (existingSku) {
        return res.status(409).json({
          success: false,
          message: `SKU '${sku}' sudah terdaftar pada produk lain.`
        });
      }
    }

    await product.update({
      category_id: category_id || product.category_id,
      sku: sku || product.sku,
      name: name || product.name,
      min_stock: min_stock !== undefined ? min_stock : product.min_stock,
      price: price !== undefined ? price : product.price,
      unit: unit || product.unit,
      location: location !== undefined ? location : product.location
    });

    const updated = await Product.findByPk(id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'code'] }]
    });

    return res.status(200).json({
      success: true,
      message: 'Data produk berhasil diperbarui.',
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui produk.',
      error: error.message
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [{ model: InventoryTransaction, as: 'transactions' }]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan.'
      });
    }

    if (product.transactions && product.transactions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Produk tidak dapat dihapus karena sudah memiliki riwayat mutasi transaksi gudang.'
      });
    }

    await product.destroy();

    return res.status(200).json({
      success: true,
      message: 'Produk berhasil dihapus.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus produk.',
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  productValidation
};
