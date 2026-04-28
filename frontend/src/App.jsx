import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PenyuplaiRoute from './components/PenyuplaiRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DataBarang from './pages/DataBarang';
import DataKategori from './pages/DataKategori';
import DataPenyuplai from './pages/DataPenyuplai';
import InputBarangMasuk from './pages/InputBarangMasuk';
import InputBarangKeluar from './pages/InputBarangKeluar';
import RiwayatTransaksi from './pages/RiwayatTransaksi';
import LaporanHarian from './pages/LaporanHarian';
import AkunPenyuplai from './pages/AkunPenyuplai';
import PenyuplaiDashboard from './pages/PenyuplaiDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
            },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Login />} />

          {/* Admin Protected with Layout */}
          <Route
            element={
              <AdminRoute>
                <Layout />
              </AdminRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/barang" element={<DataBarang />} />
            <Route path="/kategori" element={<DataKategori />} />
            <Route path="/penyuplai" element={<DataPenyuplai />} />
            <Route path="/barang-masuk" element={<InputBarangMasuk />} />
            <Route path="/barang-keluar" element={<InputBarangKeluar />} />
            <Route path="/riwayat" element={<RiwayatTransaksi />} />
            <Route path="/laporan" element={<LaporanHarian />} />
            <Route path="/akun-penyuplai" element={<AkunPenyuplai />} />
          </Route>

          {/* Penyuplai Protected */}
          <Route
            path="/penyuplai/dashboard"
            element={
              <PenyuplaiRoute>
                <PenyuplaiDashboard />
              </PenyuplaiRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
