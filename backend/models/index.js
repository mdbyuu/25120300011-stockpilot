const sequelize = require('../config/database');
const Role = require('./Role');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const InventoryTransaction = require('./InventoryTransaction');

// Role <-> User (1:N)
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// Category <-> Product (1:N)
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Product <-> InventoryTransaction (1:N)
Product.hasMany(InventoryTransaction, { foreignKey: 'product_id', as: 'transactions' });
InventoryTransaction.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// User <-> InventoryTransaction (1:N)
User.hasMany(InventoryTransaction, { foreignKey: 'user_id', as: 'transactions' });
InventoryTransaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  Role,
  User,
  Category,
  Product,
  InventoryTransaction
};
