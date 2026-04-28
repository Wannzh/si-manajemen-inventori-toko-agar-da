import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Package,
  Tags,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  Loader2,
  TrendingUp,
  Clock,
  XCircle,
} from 'lucide-react';

const statCards = [
  { key: 'totalBarang', label: 'Total Barang', icon: Package, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
  { key: 'totalKategori', label: 'Total Kategori', icon: Tags, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { key: 'totalPenyuplai', label: 'Total Penyuplai', icon: Truck, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50', text: 'text-violet-600' },
  { key: 'totalTransaksiMasuk', label: 'Transaksi Masuk', icon: ArrowDownToLine, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-600' },
  { key: 'totalTransaksiKeluar', label: 'Transaksi Keluar', icon: ArrowUpFromLine, color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50', text: 'text-rose-600' },
];

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Toko Agar D.A | Sistem Inventori';
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/api/dashboard');
      setData(res.data.data);
    } catch (err) {
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Ringkasan data inventori toko</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100
              transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center
                group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className={`w-5 h-5 ${card.text}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-300" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{data?.[card.key] ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Approval Section */}
      {data?.transaksiPending?.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-100 bg-amber-50/50 flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">⏳ Menunggu Konfirmasi Penyuplai</h3>
              <p className="text-xs text-gray-500">Transaksi barang masuk yang belum disetujui penyuplai</p>
            </div>
            <span className="ml-auto px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
              {data.transaksiPending.length} transaksi
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-amber-50/30">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Barang</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Jumlah</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Penyuplai</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Waktu Input</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.transaksiPending.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-gray-800">{item.namaBarang}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">+{item.jumlah}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{item.namaPenyuplai || '-'}</td>
                    <td className="px-6 py-3 text-xs text-gray-500">{formatDate(item.tanggalMasuk)}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">Menunggu</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejected Section */}
      {data?.transaksiRejected?.length > 0 && (
        <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50/50 flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">❌ Ditolak Penyuplai</h3>
              <p className="text-xs text-gray-500">Transaksi yang ditolak — perlu ditindaklanjuti</p>
            </div>
            <span className="ml-auto px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
              {data.transaksiRejected.length} transaksi
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-red-50/30">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Barang</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Jumlah</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Penyuplai</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Waktu</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Alasan Penolakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.transaksiRejected.map((item) => (
                  <tr key={item.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-gray-800">{item.namaBarang}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">+{item.jumlah}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{item.namaPenyuplai || '-'}</td>
                    <td className="px-6 py-3 text-xs text-gray-500">{formatDate(item.tanggalMasuk)}</td>
                    <td className="px-6 py-3 text-sm text-red-600 font-medium">{item.catatanReject || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">Peringatan Stok Minimum</h3>
            <p className="text-xs text-gray-500">Barang dengan stok ≤ stok minimum</p>
          </div>
          {data?.barangStokMinimum?.length > 0 && (
            <span className="ml-auto px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
              {data.barangStokMinimum.length} item
            </span>
          )}
        </div>

        {data?.barangStokMinimum?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Barang</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Stok</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Stok Min.</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Satuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.barangStokMinimum.map((item) => (
                  <tr key={item.id} className="hover:bg-red-50/50 transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-gray-800">{item.namaBarang}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{item.namaKategori || '-'}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                        {item.stok}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center text-sm text-gray-500">{item.stokMinimum}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{item.satuan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Semua stok barang dalam kondisi aman</p>
          </div>
        )}
      </div>
    </div>
  );
}
