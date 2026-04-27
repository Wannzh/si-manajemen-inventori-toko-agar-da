import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowUpFromLine, Loader2, Send } from 'lucide-react';

export default function InputBarangKeluar() {
  const [barang, setBarang] = useState([]);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ barangId: '', jumlah: '', keterangan: '' });
  const [selectedBarang, setSelectedBarang] = useState(null);

  useEffect(() => { document.title = 'Toko Agar D.A | Sistem Inventori'; fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [resBarang, resRiwayat] = await Promise.all([
        api.get('/api/barang'),
        api.get('/api/transaksi-keluar'),
      ]);
      setBarang(resBarang.data.data);
      setRiwayat(resRiwayat.data.data.slice(0, 10));
    } catch (err) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleBarangChange = (e) => {
    const id = e.target.value;
    setForm({ ...form, barangId: id });
    const found = barang.find((b) => b.id === parseInt(id));
    setSelectedBarang(found || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.barangId) { toast.error('Barang harus dipilih'); return; }
    if (!form.jumlah || form.jumlah === '') { toast.error('Jumlah harus lebih dari 0'); return; }
    if (parseInt(form.jumlah) <= 0) { toast.error('Jumlah harus lebih dari 0'); return; }
    setSubmitting(true);
    try {
      await api.post('/api/transaksi-keluar', {
        barangId: parseInt(form.barangId),
        jumlah: parseInt(form.jumlah),
        keterangan: form.keterangan || null,
      });
      toast.success('Barang keluar berhasil dicatat');
      setForm({ barangId: '', jumlah: '', keterangan: '' });
      setSelectedBarang(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mencatat');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
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
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Input Barang Keluar</h1>
        <p className="text-sm text-gray-500 mt-1">Catat transaksi barang keluar dan update stok otomatis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <ArrowUpFromLine className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-800">Form Barang Keluar</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Barang <span className="text-red-500">*</span></label>
                <select value={form.barangId} onChange={handleBarangChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                  <option value="">-- Pilih Barang --</option>
                  {barang.map((b) => (
                    <option key={b.id} value={b.id}>{b.namaBarang} (stok: {b.stok})</option>
                  ))}
                </select>
              </div>

              {selectedBarang && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm">
                  <p className="text-blue-700">
                    Stok tersedia: <strong>{selectedBarang.stok} {selectedBarang.satuan}</strong>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah <span className="text-red-500">*</span></label>
                <input type="number"
                  value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <textarea value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-70">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Simpan</>}
              </button>
            </form>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800">Riwayat Terakhir</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Barang</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Jumlah</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {riwayat.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(item.tanggalKeluar)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.namaBarang}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">-{item.jumlah}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{item.keterangan || '-'}</td>
                    </tr>
                  ))}
                  {riwayat.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm">Belum ada riwayat</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
