# 🍃 Sistem Informasi Manajemen Inventori — Toko Agar D.A

> Aplikasi web full-stack untuk mengelola persediaan barang (inventori) pada Usaha Dagang Toko Agar D.A, Plered, Purwakarta.  
> Dibangun sebagai proyek **Kerja Praktek** Teknik Informatika — Universitas Nasional PASIM Bandung 2025.

---

## 📋 Tentang Proyek

Toko Agar D.A adalah usaha dagang retail yang menjual produk minuman dan bahan pelengkap. Sebelumnya, seluruh pencatatan inventori dilakukan secara **manual menggunakan buku catatan**, yang menyebabkan:

- ❌ Potensi kesalahan pencatatan (*human error*)
- ❌ Proses pelaporan ke penyuplai lambat (harus mengetik ulang ke WhatsApp)
- ❌ Tidak ada peringatan saat stok barang hampir habis

Sistem ini hadir untuk menyelesaikan permasalahan tersebut dengan menghadirkan pencatatan digital yang otomatis, akurat, dan efisien.

---

## ✨ Fitur Utama

| No | Fitur | Deskripsi |
|----|-------|-----------|
| UC-01 | 🔐 Login | Autentikasi dengan JWT, sesi aman 24 jam |
| UC-02 | 📦 Kelola Data Barang | CRUD lengkap data master barang |
| UC-03 | 🏷️ Kelola Kategori | CRUD kategori barang |
| UC-04 | 🚚 Kelola Penyuplai | CRUD data penyuplai beserta kontak |
| UC-05 | ⬆️ Barang Masuk | Catat penerimaan, stok otomatis bertambah |
| UC-06 | ⬇️ Barang Keluar | Catat penjualan, stok otomatis berkurang + validasi |
| UC-07 | 🔔 Notifikasi Stok Minimum | Peringatan otomatis saat stok mendekati habis |
| UC-08 | 📊 Laporan Harian | Rekap sisa stok + kirim laporan ke WhatsApp penyuplai |
| UC-09 | 📜 Riwayat Transaksi | Log seluruh pergerakan barang dengan filter |
| UC-10 | 📁 Export PDF/Excel | Unduh laporan dalam format dokumen |

---

## 🛠️ Tech Stack

### Backend
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?style=flat&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat&logo=jsonwebtokens&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

---

## 🗂️ Struktur Proyek

```
si-manajemen-inventori-toko-agar-da/
├── backend/                          ← Spring Boot REST API
│   └── src/main/java/com/tokoagar/inventori/
│       ├── config/                   ← Security & konfigurasi
│       ├── controller/               ← REST endpoint (7 controller)
│       ├── dto/                      ← Request & Response DTO
│       ├── entity/                   ← JPA Entity (6 tabel)
│       ├── repository/               ← Spring Data JPA
│       ├── security/                 ← JWT Filter & Auth
│       └── service/                  ← Business logic (7 service)
└── frontend/                         ← React + Vite + Tailwind
    └── src/
        ├── api/                      ← Axios + JWT interceptor
        ├── components/               ← Sidebar, Navbar, Modal
        ├── context/                  ← AuthContext global state
        └── pages/                    ← 9 halaman aplikasi
```

---

## 🗄️ Struktur Database

```sql
users           → Akun pemilik toko (autentikasi)
kategori        → Kategori barang (agar-agar, susu, dll)
penyuplai       → Data pemasok barang
barang          → Master barang + stok + stok minimum
transaksi_masuk → Riwayat barang masuk dari penyuplai
transaksi_keluar→ Riwayat barang keluar (penjualan)
```

---

## 🚀 Cara Menjalankan

### Prasyarat
- Java 17+
- Node.js LTS + pnpm
- PostgreSQL 15+

### 1. Clone Repository
```bash
git clone https://github.com/USERNAME/si-manajemen-inventori-toko-agar-da.git
cd si-manajemen-inventori-toko-agar-da
```

### 2. Setup Database
```bash
# Buka psql atau pgAdmin, lalu jalankan:
CREATE DATABASE inventori_toko_agar;

# Kemudian jalankan script SQL dari file:
# backend/src/main/resources/schema.sql
```

### 3. Konfigurasi Backend
```bash
cd backend
# Edit file: src/main/resources/application.properties
# Sesuaikan username & password PostgreSQL kamu
```

### 4. Jalankan Backend
```bash
cd backend
mvn spring-boot:run
# Backend berjalan di http://localhost:8080
```

### 5. Jalankan Frontend
```bash
cd frontend
pnpm install
pnpm dev
# Frontend berjalan di http://localhost:5173
```

### 6. Login
```
URL      : http://localhost:5173
Username : admin
Password : admin123
```

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login & dapatkan JWT token |
| GET/POST/PUT/DELETE | `/api/barang` | CRUD data barang |
| GET | `/api/barang/stok-minimum` | Barang dengan stok kritis |
| GET/POST/PUT/DELETE | `/api/kategori` | CRUD kategori |
| GET/POST/PUT/DELETE | `/api/penyuplai` | CRUD penyuplai |
| GET/POST | `/api/transaksi-masuk` | Transaksi barang masuk |
| GET/POST | `/api/transaksi-keluar` | Transaksi barang keluar |
| GET | `/api/laporan/harian` | Laporan harian per penyuplai |
| GET | `/api/laporan/export/pdf` | Export laporan PDF |
| GET | `/api/laporan/export/excel` | Export laporan Excel |
| GET | `/api/riwayat` | Riwayat transaksi dengan filter |

> Semua endpoint kecuali `/api/auth/login` memerlukan header:  
> `Authorization: Bearer <token>`

---

## 📸 Halaman Aplikasi

| Halaman | Path | Deskripsi |
|---------|------|-----------|
| Login | `/` | Halaman autentikasi |
| Dashboard | `/dashboard` | Ringkasan + notifikasi stok |
| Data Barang | `/barang` | Kelola master barang |
| Data Kategori | `/kategori` | Kelola kategori |
| Data Penyuplai | `/penyuplai` | Kelola penyuplai |
| Barang Masuk | `/barang-masuk` | Input penerimaan barang |
| Barang Keluar | `/barang-keluar` | Input penjualan barang |
| Riwayat | `/riwayat` | Log semua transaksi |
| Laporan Harian | `/laporan` | Laporan + Share WA + Export |

---

## 👨‍💻 Pengembang

**Muhamad Alwan Fadhlurrohman**  
NIM: 02032311032  
Jurusan Teknik Informatika  
Fakultas Ilmu Komputer  
Universitas Nasional PASIM Bandung  

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademik **Kerja Praktek 2025**.  
© 2025 Muhamad Alwan Fadhlurrohman — Universitas Nasional PASIM Bandung.