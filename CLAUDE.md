# CLAUDE.md — Sistem Informasi Manajemen Inventori Toko Agar D.A

## Ringkasan Proyek

Aplikasi web full-stack untuk mengelola inventori (stok barang masuk & keluar)
pada Usaha Dagang Toko Agar D.A. Dibangun sebagai proyek Kerja Praktek (KP)
mahasiswa Teknik Informatika Universitas Nasional PASIM Bandung.

---

## Tech Stack

| Layer    | Teknologi                           |
| -------- | ----------------------------------- |
| Backend  | Java 17 + Spring Boot 3.x (Maven)   |
| Frontend | ReactJS + Vite + Tailwind CSS       |
| Database | PostgreSQL                          |
| Auth     | JWT (jjwt 0.12.3) + Spring Security |
| ORM      | Spring Data JPA + Hibernate         |

---

## Struktur Monorepo

```
inventori-toko-agar/          ← root project
├── CLAUDE.md                 ← file ini
├── backend/                  ← Spring Boot project
│   ├── pom.xml
│   └── src/main/java/com/tokoagar/inventori/
│       ├── config/
│       ├── controller/
│       ├── dto/
│       ├── entity/
│       ├── repository/
│       ├── security/
│       └── service/
└── frontend/                 ← React + Vite project
    ├── package.json
    └── src/
        ├── api/
        ├── components/
        ├── context/
        └── pages/
```

---

## Struktur Database — 6 Tabel PostgreSQL

```sql
-- Nama database
CREATE DATABASE inventori_toko_agar;

CREATE TABLE users (
    id           BIGSERIAL PRIMARY KEY,
    username     VARCHAR(50)  NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE kategori (
    id             BIGSERIAL PRIMARY KEY,
    nama_kategori  VARCHAR(100) NOT NULL
);

CREATE TABLE penyuplai (
    id              BIGSERIAL PRIMARY KEY,
    nama_penyuplai  VARCHAR(150) NOT NULL,
    kontak          VARCHAR(50),
    alamat          TEXT
);

CREATE TABLE barang (
    id            BIGSERIAL PRIMARY KEY,
    nama_barang   VARCHAR(150) NOT NULL,
    stok          INTEGER NOT NULL DEFAULT 0,
    stok_minimum  INTEGER NOT NULL DEFAULT 0,
    satuan        VARCHAR(30)  NOT NULL,
    kategori_id   BIGINT REFERENCES kategori(id) ON DELETE SET NULL
);

CREATE TABLE transaksi_masuk (
    id            BIGSERIAL PRIMARY KEY,
    tanggal_masuk TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    jumlah        INTEGER NOT NULL,
    keterangan    TEXT,
    barang_id     BIGINT NOT NULL REFERENCES barang(id) ON DELETE RESTRICT,
    penyuplai_id  BIGINT REFERENCES penyuplai(id) ON DELETE SET NULL
);

CREATE TABLE transaksi_keluar (
    id             BIGSERIAL PRIMARY KEY,
    tanggal_keluar TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    jumlah         INTEGER NOT NULL,
    keterangan     TEXT,
    barang_id      BIGINT NOT NULL REFERENCES barang(id) ON DELETE RESTRICT
);
```

---

## Konfigurasi Backend (application.properties)

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/inventori_toko_agar
spring.datasource.username=kp
spring.datasource.password=kerja_praktek_2025
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true

server.port=8080
spring.application.name=inventori-toko-agar

jwt.secret=TokoAgarDASecretKeyYangSangatPanjangDanAman2025MinimalHarus256Bit
jwt.expiration=86400000
```

> PENTING: `ddl-auto=validate` karena tabel sudah dibuat manual via SQL di atas.

---

## Arsitektur Backend

```
Controller (REST API)
    ↓
Service (Business Logic)
    ↓
Repository (Spring Data JPA)
    ↓
PostgreSQL
```

### Package: `com.tokoagar.inventori`

| Package      | Isi                                                         |
| ------------ | ----------------------------------------------------------- |
| `config`     | SecurityConfig, JwtConfig, DataInitializer                  |
| `controller` | AuthController, BarangController, KategoriController,       |
|              | PenyuplaiController, TransaksiMasukController,              |
|              | TransaksiKeluarController, LaporanController                |
| `dto`        | LoginRequest, LoginResponse, BarangRequest, BarangResponse, |
|              | TransaksiMasukRequest, TransaksiKeluarRequest, dll.         |
| `entity`     | Users, Kategori, Penyuplai, Barang,                         |
|              | TransaksiMasuk, TransaksiKeluar                             |
| `repository` | 1 interface JpaRepository per entity                        |
| `security`   | JwtUtil, JwtAuthFilter, UserDetailsServiceImpl              |
| `service`    | 1 service class per resource                                |

---

## REST API Endpoints

### Auth

| Method | Endpoint        | Deskripsi        | Auth? |
| ------ | --------------- | ---------------- | ----- |
| POST   | /api/auth/login | Login, dapat JWT | ❌    |

### Kategori

| Method | Endpoint           | Deskripsi           | Auth? |
| ------ | ------------------ | ------------------- | ----- |
| GET    | /api/kategori      | List semua kategori | ✅    |
| POST   | /api/kategori      | Tambah kategori     | ✅    |
| PUT    | /api/kategori/{id} | Update kategori     | ✅    |
| DELETE | /api/kategori/{id} | Hapus kategori \*   | ✅    |

> \*Validasi: tidak bisa hapus jika masih digunakan oleh barang

### Penyuplai

| Method | Endpoint            | Deskripsi            | Auth? |
| ------ | ------------------- | -------------------- | ----- |
| GET    | /api/penyuplai      | List semua penyuplai | ✅    |
| POST   | /api/penyuplai      | Tambah penyuplai     | ✅    |
| PUT    | /api/penyuplai/{id} | Update penyuplai     | ✅    |
| DELETE | /api/penyuplai/{id} | Hapus penyuplai \*   | ✅    |

> \*Validasi: tidak bisa hapus jika masih ada riwayat transaksi

### Barang

| Method | Endpoint                 | Deskripsi                        | Auth? |
| ------ | ------------------------ | -------------------------------- | ----- |
| GET    | /api/barang              | List semua barang                | ✅    |
| POST   | /api/barang              | Tambah barang                    | ✅    |
| PUT    | /api/barang/{id}         | Update barang                    | ✅    |
| DELETE | /api/barang/{id}         | Hapus barang                     | ✅    |
| GET    | /api/barang/stok-minimum | List barang stok <= stok_minimum | ✅    |

### Transaksi Masuk (UC-05)

| Method | Endpoint             | Deskripsi                            | Auth? |
| ------ | -------------------- | ------------------------------------ | ----- |
| GET    | /api/transaksi-masuk | List semua transaksi masuk           | ✅    |
| POST   | /api/transaksi-masuk | Input barang masuk + update stok (+) | ✅    |

### Transaksi Keluar (UC-06)

| Method | Endpoint              | Deskripsi                             | Auth? |
| ------ | --------------------- | ------------------------------------- | ----- |
| GET    | /api/transaksi-keluar | List semua transaksi keluar           | ✅    |
| POST   | /api/transaksi-keluar | Input barang keluar + update stok (-) | ✅    |

> Validasi UC-06: jumlah keluar TIDAK BOLEH melebihi stok tersedia → return 400

### Laporan & Riwayat

| Method | Endpoint                  | Deskripsi                             | Auth? |
| ------ | ------------------------- | ------------------------------------- | ----- |
| GET    | /api/laporan/harian       | Laporan harian ?tanggal=YYYY-MM-DD    | ✅    |
| GET    | /api/laporan/export/pdf   | Export PDF ?tanggal=YYYY-MM-DD        | ✅    |
| GET    | /api/laporan/export/excel | Export Excel ?tanggal=YYYY-MM-DD      | ✅    |
| GET    | /api/riwayat              | Riwayat transaksi dengan filter       | ✅    |
|        |                           | ?tanggal_mulai=&tanggal_akhir=&jenis= |       |

---

## Business Logic Penting

### UC-05 Input Barang Masuk

```
1. Simpan record ke tabel transaksi_masuk
2. UPDATE barang SET stok = stok + jumlah WHERE id = barang_id
3. Kedua operasi dalam 1 @Transactional
```

### UC-06 Input Barang Keluar

```
1. Cek: stok barang >= jumlah yang diminta
   → Jika tidak: throw exception → return HTTP 400
2. Simpan record ke tabel transaksi_keluar
3. UPDATE barang SET stok = stok - jumlah WHERE id = barang_id
4. Kedua operasi dalam 1 @Transactional
```

### UC-07 Notifikasi Stok Minimum

```
Query: SELECT * FROM barang WHERE stok <= stok_minimum
Dipanggil otomatis saat frontend load halaman Dashboard
```

### UC-08 Laporan Harian

```
Query transaksi_masuk WHERE DATE(tanggal_masuk) = tanggal_param
Gabungkan dengan stok sisa barang saat ini
Frontend tampilkan tombol Share → buka WhatsApp Web dengan pesan pre-filled
```

---

## Konfigurasi Security

```
- Semua endpoint /api/** → wajib JWT Bearer Token
- Pengecualian: POST /api/auth/login → public (tidak perlu token)
- CORS: allow origin http://localhost:5173 (Vite dev server)
- Password: BCryptPasswordEncoder
```

---

## User Default (DataInitializer)

```
username : admin
password : admin123  (di-hash BCrypt saat app pertama jalan)
```

DataInitializer harus mengecek apakah user sudah ada sebelum insert,
agar tidak duplikat setiap kali aplikasi restart.

---

## Konfigurasi Frontend

### Axios Base URL

```javascript
// src/api/axios.js
baseURL: "http://localhost:8080";
// Interceptor: tambahkan Authorization: Bearer <token> di setiap request
// Token diambil dari localStorage key: 'token'
```

### React Router — 9 Halaman

| Path           | Komponen          | Protected? |
| -------------- | ----------------- | ---------- |
| /              | Login             | ❌         |
| /dashboard     | Dashboard         | ✅         |
| /barang        | DataBarang        | ✅         |
| /kategori      | DataKategori      | ✅         |
| /penyuplai     | DataPenyuplai     | ✅         |
| /barang-masuk  | InputBarangMasuk  | ✅         |
| /barang-keluar | InputBarangKeluar | ✅         |
| /riwayat       | RiwayatTransaksi  | ✅         |
| /laporan       | LaporanHarian     | ✅         |

### Layout Frontend

```
- Halaman Login    : full page, tidak ada sidebar
- Semua halaman lain: Sidebar (kiri) + Navbar (atas) + Konten (kanan)
- Warna tema       : Indigo/biru (profesional)
- Sidebar berisi   : link ke semua menu utama + tombol Logout
```

### pnpm Dependencies (Gunakan pnpm, BUKAN npm)

```
Setup frontend:
  pnpm create vite@latest frontend -- --template react
  cd frontend
  pnpm install
  pnpm add axios react-router-dom react-hot-toast lucide-react
  pnpm add tailwindcss @tailwindcss/vite

Konfigurasi Tailwind v4:
  1. Tambahkan plugin di vite.config.js:
      import tailwindcss from '@tailwindcss/vite'
      export default {
        plugins: [
          tailwindcss(),
        ],
      }

  2. Tambahkan import di src/index.css:
      @import "tailwindcss";
      (TIDAK perlu @tailwind base/components/utilities)

CATATAN: Ini adalah Tailwind CSS v4.
Tidak perlu tailwind.config.js, postcss.config.js, atau autoprefixer.

dependencies:
  - axios
  - react-router-dom
  - react-hot-toast
  - lucide-react
  - tailwindcss
  - @tailwindcss/vite
```

---

## Aturan Coding

1. **Backend**: Selalu gunakan `@Transactional` untuk operasi yang mengubah stok
2. **Backend**: Semua response API menggunakan format JSON `{ "status": "...", "message": "...", "data": ... }`
3. **Backend**: Gunakan DTO (bukan Entity langsung) untuk request dan response
4. **Frontend**: Gunakan `AuthContext` untuk state login global
5. **Frontend**: Semua halaman yang butuh auth dibungkus `<ProtectedRoute>`
6. **Frontend**: Tampilkan loading state saat fetch data dari API
7. **Frontend**: Gunakan `react-hot-toast` untuk notifikasi sukses/error
8. **Frontend**: Gunakan `pnpm` sebagai package manager, BUKAN npm atau yarn

---

## Catatan Pengembangan

- Backend berjalan di port **8080**
- Frontend berjalan di port **5173** (Vite default)
- Urutan pengerjaan yang disarankan:
  1. Entity + Repository
  2. Security (JWT)
  3. Service + Controller per fitur
  4. Frontend per halaman
