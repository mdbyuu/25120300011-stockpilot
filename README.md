# 📦 Warehouse Inventory Management System
> **Aplikasi Full-Stack Web Operasional Inventaris Gudang**  
> Tugas: UAS Web Application Development — Universitas Cakrawala  
> Arsitektur: **Backend MVC REST API (Node.js + Express + Sequelize MySQL)** & **Frontend (Vue 3 + Vite + Pinia)**

---

## 🌟 Fitur Utama Aplikasi

1. **Dashboard Monitoring Real-Time:**
   - 4 Card Metrik KPI: Total SKU Produk, Total Kuantitas Fisik Stok, Valuasi Total Aset (Rp), dan Alert Stok Menipis.
   - Tabel Peringatan Low Stock otomatis dengan tombol shortcut *Restock*.
   - Aktivitas Mutasi Terkini dengan indikator status visual (Masuk / Keluar / Opname).
2. **Master Data Produk (CRUD Penuh):**
   - Tambah, Lihat, Edit, Hapus data barang dengan kode SKU unik, batas minimum stok, unit, harga, dan lokasi rak gudang.
   - Fitur pencarian instan dan penyaringan berdasarkan kategori & status stok rendah.
3. **Master Kategori Barang (RBAC Admin):**
   - Pengelompokan jenis barang logistik (Bahan Baku, Sparepart, Elektronik, Barang Jadi).
   - Dilindungi proteksi integritas: kategori tidak dapat dihapus jika masih menaungi produk aktif.
4. **Pencatatan Mutasi Stok & Audit Trail:**
   - **Barang Masuk (Stock In):** Penerimaan barang dari supplier, otomatis menambah stok.
   - **Barang Keluar (Stock Out):** Pengeluaran barang dengan validasi ketat agar stok tidak minus.
   - **Stock Opname (Adjustment):** Penyelarasan stok fisik dengan sistem (Khusus peran Admin).
   - **Atomic ACID Transaction:** Memastikan pencatatan ledger dan pembaruan stok terjadi serentak tanpa inkonsistensi data.
5. **Keamanan & Manajemen Sesi (CPMK 4):**
   - Autentikasi JWT dengan penyimpanan terproteksi.
   - Password dienkripsi dengan algoritma `bcryptjs`.
   - Pencegahan SQL Injection melalui *Parameterized Queries* Sequelize ORM.
   - Sanitasi input dan proteksi Cross-Origin dengan `helmet` dan `cors`.
   - Role-Based Access Control (RBAC): Membedakan hak wewenang antara **Admin Gudang** dan **Staff Gudang**.

---

## 🔑 Kredensial Akun Demo (Untuk Pengujian & Dosen)

| Peran (Role) | Email Login | Password Default | Hak Akses |
|---|---|---|---|
| **Admin Gudang** | `admin@gudang.local` | `password123` | Akses Penuh: Master Kategori, Produk, Mutasi, Opname, Hapus Data |
| **Staff Lapangan** | `staff@gudang.local` | `password123` | Akses Operasional: Input Barang Masuk, Input Barang Keluar, Lihat Katalog |

*(Tersedia tombol satu-klik pada halaman Login untuk pengujian instan)*.

---

## 🚀 Panduan Instalasi & Menjalankan di Komputer Lokal

### 1. Prasyarat
- **Node.js** (v18 atau lebih baru)
- **MySQL / MariaDB** (melalui XAMPP, Laragon, atau MySQL Server standalone)

### 2. Setup Basis Data MySQL
1. Pastikan service MySQL sedang berjalan (Port default: `3306`).
2. Buat basis data bernama `inventory_db` atau import file `backend/database/schema.sql` melalui phpMyAdmin / MySQL Workbench:
   ```sql
   CREATE DATABASE IF NOT EXISTS inventory_db;
   ```
3. File dump SQL siap pakai untuk pengumpulan UAS tersedia di:
   [backend/database/schema.sql](file:///c:/Users/LOQ/UAS%20FULLSTACK/backend/database/schema.sql)

### 3. Menjalankan Backend API
1. Buka terminal pada folder `backend`:
   ```bash
   cd backend
   npm install
   ```
2. Salin environment configuration:
   ```bash
   copy .env.example .env
   ```
   *(Sesuaikan kredensial `DB_USER` dan `DB_PASS` jika MySQL menggunakan password)*.
3. Jalankan migrasi dan seeder data awal:
   ```bash
   npm run seed
   ```
4. Jalankan server backend:
   ```bash
   npm run dev
   ```
   Backend aktif di: `http://localhost:5001`

### 4. Menjalankan Frontend Vue 3
1. Buka terminal baru pada folder `frontend`:
   ```bash
   cd frontend
   npm install
   ```
2. Jalankan development server:
   ```bash
   npm run dev
   ```
3. Buka browser pada alamat: **`http://localhost:5173`**

## 🐳 Menjalankan dengan Docker Compose

Docker Compose menjalankan tiga service: frontend Vue/Nginx, backend Express, dan MySQL dengan volume persisten.

1. Pastikan Docker Desktop sudah berjalan.
2. Buat file environment Docker:
   ```bash
   copy .env.docker.example .env
   ```
3. Ganti semua nilai password dan `JWT_SECRET` pada `.env`.
4. Build dan jalankan service:
   ```bash
   docker compose up -d --build
   ```
5. Isi database satu kali:
   ```bash
   docker compose exec backend npm run seed
   ```
6. Buka aplikasi pada **`http://localhost:8080`**. API tersedia pada **`http://localhost:5002`**.

Periksa status service dan endpoint database:
```bash
docker compose ps
curl http://localhost:5002/api/health
```

Data MySQL disimpan pada volume `mysql_data`, sehingga restart container tidak menghapus data. Jangan menjalankan `docker compose down -v` kecuali memang ingin menghapus database dan seluruh datanya.

Untuk deployment pada server Docker, ubah `FRONTEND_URL` dan `VITE_API_URL` menjadi domain HTTPS publik sebelum menjalankan `docker compose up -d --build`. Variabel `VITE_API_URL` tertanam saat frontend dibuild, jadi frontend harus dibuild ulang setelah nilainya berubah.

### VPS dengan Aiven MySQL

Jika MySQL di-host oleh Aiven, gunakan `docker-compose.aiven.yml` agar VPS hanya menjalankan frontend dan backend:

```bash
docker compose -f docker-compose.aiven.yml up -d --build
docker compose -f docker-compose.aiven.yml exec backend npm run seed
```

Isi `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_SSL=true`, dan `DB_SSL_REJECT_UNAUTHORIZED=false` pada file `.env` di VPS. Jangan membuka port MySQL `3306` pada VPS.

---

## 🌐 Panduan Deployment Online (CPMK 5)

Aplikasi siap di-deploy ke lingkungan cloud publik gratis:
1. **Database:** Buat instance MySQL gratis di **Aiven for MySQL** atau **Railway MySQL**, lalu perbarui variabel environment `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, dan `DB_NAME`.
2. **Backend:** Deploy repository folder `backend` ke **Render (Web Service)** dengan build command `npm install` dan start command `node server.js`.
3. **Frontend:** Deploy folder `frontend` ke **Vercel** atau **Netlify** dengan build command `npm run build` dan output directory `dist`, serta atur environment variable `VITE_API_URL` mengarah ke URL live backend Render.

---

## 📁 Struktur Direktori Proyek

```text
UAS FULLSTACK/
├── backend/
│   ├── config/database.js          # Koneksi MySQL Sequelize ORM
│   ├── controllers/                # Logika Bisnis MVC
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── productController.js
│   │   ├── transactionController.js
│   │   └── dashboardController.js
│   ├── middlewares/                # Auth JWT, RBAC, Validator
│   ├── models/                     # 5 Model Relasional MySQL
│   ├── routes/                     # Router API Terstruktur
│   ├── database/
│   │   ├── schema.sql              # Dump SQL untuk Deliverable UAS
│   │   └── seeders.js              # Script Seeding Otomatis
│   ├── .env.example
│   └── server.js                   # Server Entry Point
│
├── frontend/
│   ├── src/
│   │   ├── api/index.js            # Axios Interceptors
│   │   ├── assets/main.css         # Custom Design System
│   │   ├── components/Sidebar.vue  # Navigasi & Profil RBAC
│   │   ├── router/index.js         # Vue Router + Auth Guards
│   │   ├── stores/auth.js          # Pinia Auth State
│   │   └── views/                  # Halaman Vue (Login, Register, Dashboard, Products, Categories, Transactions)
│   ├── index.html
│   └── package.json
│
├── PRD.md                          # Dokumen Spesifikasi Kebutuhan Lengkap
└── README.md                       # Panduan Instalasi & Penggunaan
```
