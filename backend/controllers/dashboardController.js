const { Op } = require('sequelize');
const { Product, Category, InventoryTransaction, User } = require('../models');

const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.count();
    const totalCategories = await Category.count();
    const totalUsers = await User.count();

    const products = await Product.findAll({
      attributes: ['id', 'name', 'sku', 'stock', 'min_stock', 'price', 'unit'],
      include: [{ model: Category, as: 'category', attributes: ['name'] }]
    });

    let totalStockPhysical = 0;
    let totalInventoryValue = 0;
    const lowStockProducts = [];

    products.forEach(p => {
      totalStockPhysical += p.stock;
      totalInventoryValue += (p.stock * parseFloat(p.price || 0));

      if (p.stock <= p.min_stock) {
        lowStockProducts.push({
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category ? p.category.name : '-',
          stock: p.stock,
          min_stock: p.min_stock,
          unit: p.unit
        });
      }
    });

    // Hitung transaksi hari ini
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayTransactionsCount = await InventoryTransaction.count({
      where: {
        transaction_date: {
          [Op.gte]: startOfToday
        }
      }
    });

    // 5 Transaksi terakhir
    const recentTransactions = await InventoryTransaction.findAll({
      limit: 5,
      order: [['transaction_date', 'DESC'], ['id', 'DESC']],
      include: [
        { model: Product, as: 'product', attributes: ['id', 'sku', 'name', 'unit'] },
        { model: User, as: 'user', attributes: ['name'] }
      ]
    });

    return res.status(200).json({
      success: true,
      data: {
        kpi: {
          total_products: totalProducts,
          total_categories: totalCategories,
          total_users: totalUsers,
          total_stock_physical: totalStockPhysical,
          total_inventory_value: totalInventoryValue,
          low_stock_count: lowStockProducts.length,
          today_transactions: todayTransactionsCount
        },
        low_stock_items: lowStockProducts,
        recent_transactions: recentTransactions
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data ringkasan dashboard.',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats
};
