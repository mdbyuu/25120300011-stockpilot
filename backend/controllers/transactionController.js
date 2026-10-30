const { body } = require('express-validator');
const { sequelize, Product, Category, InventoryTransaction, User } = require('../models');

const transactionValidation = [
  body('product_id').isInt().withMessage('ID Produk harus berupa angka valid.'),
  body('type').isIn(['IN', 'OUT', 'ADJUSTMENT']).withMessage('Tipe transaksi harus IN, OUT, atau ADJUSTMENT.'),
  body('quantity').isInt({ min: 1 }).withMessage('Jumlah kuantitas minimal 1.'),
  body('note').optional().trim().escape()
];

const getTransactions = async (req, res) => {
  try {
    const { type, product_id, limit = 50 } = req.query;

    const whereClause = {};
    if (type) whereClause.type = type;
    if (product_id) whereClause.product_id = product_id;

    const transactions = await InventoryTransaction.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'category_id', 'sku', 'name', 'unit', 'price'],
          include: [{ model: Category, as: 'category', attributes: ['name'] }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['transaction_date', 'DESC'], ['id', 'DESC']],
      limit: parseInt(limit)
    });

    return res.status(200).json({
      success: true,
      total: transactions.length,
      data: transactions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil riwayat transaksi mutasi stok.',
      error: error.message
    });
  }
};

const createTransaction = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { product_id, type, quantity, note } = req.body;
    const qty = parseInt(quantity, 10);

    const product = await Product.findByPk(product_id, {
      lock: true,
      transaction: t
    });

    if (!product) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan.'
      });
    }

    const previousStock = product.stock;
    let currentStock = previousStock;

    if (type === 'IN') {
      currentStock = previousStock + qty;
    } else if (type === 'OUT') {
      if (previousStock < qty) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Stok tidak mencukupi untuk pengeluaran barang! Stok tersedia: ${previousStock} ${product.unit}, permintaan: ${qty} ${product.unit}.`
        });
      }
      currentStock = previousStock - qty;
    } else if (type === 'ADJUSTMENT') {
      // Penyesuaian stok fisik (Opname) - hanya boleh oleh Admin
      const userRole = req.user?.role?.name ? req.user.role.name.toLowerCase() : '';
      if (userRole !== 'admin') {
        await t.rollback();
        return res.status(403).json({
          success: false,
          message: 'Hanya peran Admin yang diizinkan melakukan penyesuaian stok opname (ADJUSTMENT).'
        });
      }
      currentStock = qty; // Nilai qty adalah stok riil hasil opname
    }

    // Perbarui stok produk
    await product.update({ stock: currentStock }, { transaction: t });

    // Generate Nomor Referensi Unik
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceNo = `TRX-${type}-${dateStr}-${randomSuffix}`;

    // Catat log transaksi mutasi
    const transactionRecord = await InventoryTransaction.create({
      reference_no: referenceNo,
      product_id: product.id,
      user_id: req.user.id,
      type,
      quantity: type === 'ADJUSTMENT' ? Math.abs(currentStock - previousStock) : qty,
      previous_stock: previousStock,
      current_stock: currentStock,
      note: note || (type === 'IN' ? 'Penerimaan barang masuk' : type === 'OUT' ? 'Pengeluaran barang logistik' : 'Penyesuaian stok opname'),
      transaction_date: new Date()
    }, { transaction: t });

    // Commit transaksi basis data (ACID)
    await t.commit();

    const fullRecord = await InventoryTransaction.findByPk(transactionRecord.id, {
      include: [
        { model: Product, as: 'product', attributes: ['id', 'sku', 'name', 'unit'] },
        { model: User, as: 'user', attributes: ['id', 'name'] }
      ]
    });

    return res.status(201).json({
      success: true,
      message: `Mutasi stok ${type} berhasil dicatat. Stok terkini: ${currentStock} ${product.unit}.`,
      data: fullRecord
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: 'Gagal memproses transaksi inventaris.',
      error: error.message
    });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  transactionValidation
};
