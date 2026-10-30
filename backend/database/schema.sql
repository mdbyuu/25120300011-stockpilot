-- ========================================================
-- UAS Web Application Development - Universitas Cakrawala
-- Studi Kasus: Sistem Manajemen Inventaris Gudang
-- Skema Basis Data Relasional MySQL (5 Tabel Berelasi)
-- ========================================================

CREATE DATABASE IF NOT EXISTS `inventory_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `inventory_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tabel roles (RBAC)
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabel users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `role_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabel categories
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabel products
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `sku` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `min_stock` INT NOT NULL DEFAULT 5,
  `price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `unit` VARCHAR(30) NOT NULL DEFAULT 'pcs',
  `location` VARCHAR(100) NULL DEFAULT 'Rak Gudang A',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_products_sku` (`sku`),
  INDEX `idx_products_stock` (`stock`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabel inventory_transactions (Ledger Mutasi Stok & Audit Trail)
DROP TABLE IF EXISTS `inventory_transactions`;
CREATE TABLE `inventory_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `reference_no` VARCHAR(50) NOT NULL UNIQUE,
  `product_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `type` ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
  `quantity` INT NOT NULL,
  `previous_stock` INT NOT NULL,
  `current_stock` INT NOT NULL,
  `note` TEXT NULL,
  `transaction_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_transactions_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_transactions_date` (`transaction_date`),
  INDEX `idx_transactions_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- DATA SEEDERS AWAL
-- ========================================================

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'admin', 'Administrator sistem gudang dengan hak akses penuh'),
(2, 'staff', 'Operator gudang lapangan untuk pencatatan keluar-masuk barang');

-- Password default: 'password123' (bcrypt hash)
INSERT INTO `users` (`id`, `role_id`, `name`, `email`, `password`, `created_at`, `updated_at`) VALUES
(1, 1, 'Budi Santoso (Admin Gudang)', 'admin@gudang.local', '$2a$10$fVf4hG80oH8N6r1t86F0EeeoW1QyH7b7i2r173aJ82a4h7747e7uK', NOW(), NOW()),
(2, 2, 'Rian Pratama (Petugas Lapangan)', 'staff@gudang.local', '$2a$10$fVf4hG80oH8N6r1t86F0EeeoW1QyH7b7i2r173aJ82a4h7747e7uK', NOW(), NOW());

INSERT INTO `categories` (`id`, `name`, `code`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Bahan Baku & Material', 'MAT', 'Material mentah kebutuhan perakitan dan produksi', NOW(), NOW()),
(2, 'Suku Cadang & Sparepart', 'PRT', 'Komponen mekanik dan suku cadang mesin', NOW(), NOW()),
(3, 'Peralatan Elektronik', 'ELK', 'Sensor, kabel, mikrokontroler, modul sirkuit', NOW(), NOW()),
(4, 'Barang Jadi (Finished Goods)', 'FGD', 'Produk siap kirim ke distributor / konsumen', NOW(), NOW());

INSERT INTO `products` (`id`, `category_id`, `sku`, `name`, `stock`, `min_stock`, `price`, `unit`, `location`, `created_at`, `updated_at`) VALUES
(1, 1, 'MAT-ST-001', 'Pelat Baja Galvanis 2mm x 1m', 45, 15, 185000.00, 'lembar', 'Zona A - Rak 01', NOW(), NOW()),
(2, 1, 'MAT-AL-002', 'Aluminium Profil T-Slot 2020', 8, 10, 65000.00, 'batang', 'Zona A - Rak 02', NOW(), NOW()),
(3, 2, 'PRT-BR-101', 'Ball Bearing 608ZZ High Speed', 120, 30, 15000.00, 'pcs', 'Zona B - Bin 12', NOW(), NOW()),
(4, 2, 'PRT-GT-102', 'Timing Belt GT2 6mm Rubber', 4, 15, 25000.00, 'meter', 'Zona B - Bin 14', NOW(), NOW()),
(5, 3, 'ELK-PS-201', 'Power Supply Switching 24V 15A 360W', 22, 5, 210000.00, 'unit', 'Zona C - Rak El-1', NOW(), NOW()),
(6, 3, 'ELK-SN-202', 'Sensor Proximity Induktif NPN 5mm', 2, 8, 45000.00, 'pcs', 'Zona C - Rak El-2', NOW(), NOW()),
(7, 4, 'FGD-3D-301', 'Mesin 3D Printer Delta Precision X1', 14, 5, 4850000.00, 'unit', 'Gudang Display - Zona D', NOW(), NOW());

INSERT INTO `inventory_transactions` (`id`, `reference_no`, `product_id`, `user_id`, `type`, `quantity`, `previous_stock`, `current_stock`, `note`, `transaction_date`, `created_at`, `updated_at`) VALUES
(1, 'INIT-MAT-ST-001', 1, 1, 'IN', 45, 0, 45, 'Saldo awal setup inventaris gudang', NOW(), NOW(), NOW()),
(2, 'INIT-MAT-AL-002', 2, 1, 'IN', 8, 0, 8, 'Saldo awal setup inventaris gudang', NOW(), NOW(), NOW()),
(3, 'INIT-PRT-BR-101', 3, 1, 'IN', 120, 0, 120, 'Saldo awal setup inventaris gudang', NOW(), NOW(), NOW()),
(4, 'INIT-PRT-GT-102', 4, 1, 'IN', 4, 0, 4, 'Saldo awal setup inventaris gudang', NOW(), NOW(), NOW()),
(5, 'INIT-ELK-PS-201', 5, 1, 'IN', 22, 0, 22, 'Saldo awal setup inventaris gudang', NOW(), NOW(), NOW()),
(6, 'INIT-ELK-SN-202', 6, 1, 'IN', 2, 0, 2, 'Saldo awal setup inventaris gudang', NOW(), NOW(), NOW()),
(7, 'INIT-FGD-3D-301', 7, 1, 'IN', 14, 0, 14, 'Saldo awal setup inventaris gudang', NOW(), NOW(), NOW());
