import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { History, Search, Loader2, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export default function RiwayatTransaksi() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState({
    tanggal_mulai: new Date().toISOString().split('T')[0],
    tanggal_akhir: new Date().toISOString().split('T')[0],
    jenis: 'semua',
  });

  const fetchRiwayat = async (params) => {
    setLoading(true);
    try {
      const res = await api.get('/api/riwayat', { params: params || filter });
      setData(res.data.data);
    } catch (err) {
      toast.error('Gagal memuat riwayat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Toko Agar D.A | Sistem Inventori';
    fetchRiwayat();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    fetchRiwayat(filter);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Riwayat Transaksi</h1>
        <p className="text-sm text-gray-500 mt-1">Lihat riwayat transaksi masuk dan keluar berdasarkan filter</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
            <input type="date" value={filter.tanggal_mulai}
              onChange={(e) => setFilter({ ...filter, tanggal_mulai: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
            <input type="date" value={filter.tanggal_akhir}
              onChange={(e) => setFilter({ ...filter, tanggal_akhir: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
            <select value={filter.jenis} onChange={(e) => setFilter({ ...filter, jenis: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
              <option value="semua">Semua</option>
              <option value="masuk">Masuk</option>
              <option value="keluar">Keluar</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-70">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Cari
          </button>
        </form>
      </div>

      {/* Results */}
      {data && (
        <div className="space-y-6">
          {/* Transaksi Masuk */}
          {data.transaksiMasuk?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <ArrowDownToLine className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-800">Transaksi Masuk</h3>
                <span className="ml-auto px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  {data.transaksiMasuk.length} transaksi
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Barang</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Jumlah</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Penyuplai</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.transaksiMasuk.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3 text-sm text-gray-500">{formatDate(item.tanggalMasuk)}</td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-800">{item.namaBarang}</td>
                        <td className="px-6 py-3 text-center">
                          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">+{item.jumlah}</span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">{item.namaPenyuplai || '-'}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{item.keterangan || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transaksi Keluar */}
          {data.transaksiKeluar?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                  <ArrowUpFromLine className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-800">Transaksi Keluar</h3>
                <span className="ml-auto px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                  {data.transaksiKeluar.length} transaksi
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Barang</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Jumlah</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.transaksiKeluar.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3 text-sm text-gray-500">{formatDate(item.tanggalKeluar)}</td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-800">{item.namaBarang}</td>
                        <td className="px-6 py-3 text-center">
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">-{item.jumlah}</span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">{item.keterangan || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty state */}
          {(!data.transaksiMasuk?.length && !data.transaksiKeluar?.length) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-400">Tidak ada transaksi pada periode yang dipilih</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
