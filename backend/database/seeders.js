require('dotenv').config();
const mysql = require('mysql2/promise');

const seedDatabase = async () => {
  try {
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = process.env.DB_PORT || 3306;
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASS || '';
    const dbName = process.env.DB_NAME || 'inventory_db';
    const sslEnabled = process.env.DB_SSL === 'true';
    const sslRejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';

    console.log(`🔄 Memeriksa dan membuat basis data '${dbName}' jika belum ada...`);
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      ...(sslEnabled
        ? {
            ssl: {
              rejectUnauthorized: sslRejectUnauthorized,
              ...(process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA } : {})
            }
          }
        : {})
    });
    if (dbName !== 'defaultdb') {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    }
    await connection.end();
    console.log(`✅ Basis data '${dbName}' siap digunakan.`);

    const { sequelize, Role, User, Category, Product, InventoryTransaction } = require('../models');

    console.log('🔄 Memulai proses migrasi dan sinkronisasi skema tabel...');
    // Sinkronisasi skema tabel ke MySQL
    await sequelize.sync({ alter: true });
    console.log('✅ Skema tabel berhasil disinkronisasi ke basis data MySQL!');

    // 1. Seed Roles
    const [adminRole] = await Role.findOrCreate({
      where: { name: 'admin' },
      defaults: {
        name: 'admin',
        description: 'Administrator sistem gudang dengan hak akses penuh'
      }
    });

    const [staffRole] = await Role.findOrCreate({
      where: { name: 'staff' },
      defaults: {
        name: 'staff',
        description: 'Operator gudang lapangan untuk pencatatan keluar-masuk barang'
      }
    });

    console.log('✅ Roles berhasil diinisialisasi: admin, staff');

    // 2. Seed Users
    const [adminUser] = await User.findOrCreate({
      where: { email: 'admin@gudang.local' },
      defaults: {
        name: 'Budi Santoso (Admin Gudang)',
        email: 'admin@gudang.local',
        password: 'password123',
        role_id: adminRole.id
      }
    });

    const [staffUser] = await User.findOrCreate({
      where: { email: 'staff@gudang.local' },
      defaults: {
        name: 'Rian Pratama (Petugas Lapangan)',
        email: 'staff@gudang.local',
        password: 'password123',
        role_id: staffRole.id
      }
    });

    console.log('✅ Akun demo berhasil dibuat:');
    console.log('   - Admin: admin@gudang.local (pass: password123)');
    console.log('   - Staff: staff@gudang.local (pass: password123)');

    // 3. Seed Categories
    const categoriesData = [
      { name: 'Bahan Baku & Material', code: 'MAT', description: 'Material mentah kebutuhan perakitan dan produksi' },
      { name: 'Suku Cadang & Sparepart', code: 'PRT', description: 'Komponen mekanik dan suku cadang mesin' },
      { name: 'Peralatan Elektronik', code: 'ELK', description: 'Sensor, kabel, mikrokontroler, modul sirkuit' },
      { name: 'Barang Jadi (Finished Goods)', code: 'FGD', description: 'Produk siap kirim ke distributor / konsumen' }
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      const [record] = await Category.findOrCreate({
        where: { code: cat.code },
        defaults: cat
      });
      categoryMap[cat.code] = record.id;
    }
    console.log('✅ 4 Kategori master berhasil dibuat.');

    // 4. Seed Products
    const productsData = [
      {
        category_id: categoryMap['MAT'],
        sku: 'MAT-ST-001',
        name: 'Pelat Baja Galvanis 2mm x 1m',
        stock: 45,
        min_stock: 15,
        price: 185000,
        unit: 'lembar',
        location: 'Zona A - Rak 01'
      },
      {
        category_id: categoryMap['MAT'],
        sku: 'MAT-AL-002',
        name: 'Aluminium Profil T-Slot 2020',
        stock: 8, // Mendekati low stock
        min_stock: 10,
        price: 65000,
        unit: 'batang',
        location: 'Zona A - Rak 02'
      },
      {
        category_id: categoryMap['PRT'],
        sku: 'PRT-BR-101',
        name: 'Ball Bearing 608ZZ High Speed',
        stock: 120,
        min_stock: 30,
        price: 15000,
        unit: 'pcs',
        location: 'Zona B - Bin 12'
      },
      {
        category_id: categoryMap['PRT'],
        sku: 'PRT-GT-102',
        name: 'Timing Belt GT2 6mm Rubber',
        stock: 4, // Status Low Stock Alert
        min_stock: 15,
        price: 25000,
        unit: 'meter',
        location: 'Zona B - Bin 14'
      },
      {
        category_id: categoryMap['ELK'],
        sku: 'ELK-PS-201',
        name: 'Power Supply Switching 24V 15A 360W',
        stock: 22,
        min_stock: 5,
        price: 210000,
        unit: 'unit',
        location: 'Zona C - Rak El-1'
      },
      {
        category_id: categoryMap['ELK'],
        sku: 'ELK-SN-202',
        name: 'Sensor Proximity Induktif NPN 5mm',
        stock: 2, // Kritis (Low Stock)
        min_stock: 8,
        price: 45000,
        unit: 'pcs',
        location: 'Zona C - Rak El-2'
      },
      {
        category_id: categoryMap['FGD'],
        sku: 'FGD-3D-301',
        name: 'Mesin 3D Printer Delta Precision X1',
        stock: 14,
        min_stock: 5,
        price: 4850000,
        unit: 'unit',
        location: 'Gudang Display - Zona D'
      }
    ];

    for (const prod of productsData) {
      const [productRecord, created] = await Product.findOrCreate({
        where: { sku: prod.sku },
        defaults: prod
      });

      if (created) {
        // Catat transaksi saldo awal
        await InventoryTransaction.create({
          reference_no: `INIT-${productRecord.sku}`,
          product_id: productRecord.id,
          user_id: adminUser.id,
          type: 'IN',
          quantity: productRecord.stock,
          previous_stock: 0,
          current_stock: productRecord.stock,
          note: 'Saldo awal setup inventaris gudang',
          transaction_date: new Date()
        });
      }
    }
    console.log(`✅ ${productsData.length} Produk dummy dengan mutasi awal berhasil diisi.`);

    console.log('🎉 Seeding database inventaris selesai secara sempurna!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
