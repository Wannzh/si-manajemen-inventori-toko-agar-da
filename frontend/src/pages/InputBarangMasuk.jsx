import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowDownToLine, Loader2, Send } from 'lucide-react';

export default function InputBarangMasuk() {
  const [barang, setBarang] = useState([]);
  const [penyuplai, setPenyuplai] = useState([]);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ barangId: '', penyuplaiId: '', jumlah: '', keterangan: '' });

  useEffect(() => { document.title = 'Toko Agar D.A | Sistem Inventori'; fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [resBarang, resPenyuplai, resRiwayat] = await Promise.all([
        api.get('/api/barang'),
        api.get('/api/penyuplai'),
        api.get('/api/transaksi-masuk'),
      ]);
      setBarang(resBarang.data.data);
      setPenyuplai(resPenyuplai.data.data);
      setRiwayat(resRiwayat.data.data.slice(0, 10));
    } catch (err) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/transaksi-masuk', {
        barangId: parseInt(form.barangId),
        penyuplaiId: form.penyuplaiId ? parseInt(form.penyuplaiId) : null,
        jumlah: parseInt(form.jumlah),
        keterangan: form.keterangan || null,
      });
      toast.success('Barang masuk berhasil dicatat');
      setForm({ barangId: '', penyuplaiId: '', jumlah: '', keterangan: '' });
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
        <h1 className="text-2xl font-bold text-gray-800">Input Barang Masuk</h1>
        <p className="text-sm text-gray-500 mt-1">Catat transaksi barang masuk dan update stok otomatis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <ArrowDownToLine className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-800">Form Barang Masuk</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barang *</label>
                <select value={form.barangId} onChange={(e) => setForm({ ...form, barangId: e.target.value })} required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                  <option value="">-- Pilih Barang --</option>
                  {barang.map((b) => (
                    <option key={b.id} value={b.id}>{b.namaBarang} (stok: {b.stok})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Penyuplai</label>
                <select value={form.penyuplaiId} onChange={(e) => setForm({ ...form, penyuplaiId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                  <option value="">-- Pilih Penyuplai --</option>
                  {penyuplai.map((p) => (
                    <option key={p.id} value={p.id}>{p.namaPenyuplai}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah *</label>
                <input type="number" min="1" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <textarea value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20 disabled:opacity-70">
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Penyuplai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {riwayat.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(item.tanggalMasuk)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.namaBarang}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">+{item.jumlah}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.namaPenyuplai || '-'}</td>
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
