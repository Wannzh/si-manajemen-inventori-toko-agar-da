import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Truck, Plus, Pencil, Trash2, X, Loader2, Search } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function DataPenyuplai() {
  const [penyuplai, setPenyuplai] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ namaPenyuplai: '', kontak: '', alamat: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [kontakError, setKontakError] = useState('');

  useEffect(() => { document.title = 'Toko Agar D.A | Sistem Inventori'; fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/api/penyuplai');
      setPenyuplai(res.data.data);
    } catch (err) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ namaPenyuplai: '', kontak: '', alamat: '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setForm({ namaPenyuplai: item.namaPenyuplai, kontak: item.kontak || '', alamat: item.alamat || '' });
    setShowModal(true);
  };

  const handleKontakChange = (value) => {
    // Hanya izinkan angka
    const cleaned = value.replace(/[^0-9]/g, '');
    setForm({ ...form, kontak: cleaned });

    if (cleaned && (cleaned.length < 10 || cleaned.length > 15)) {
      setKontakError('Kontak harus 10-15 digit angka');
    } else {
      setKontakError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.kontak && (form.kontak.length < 10 || form.kontak.length > 15)) {
      setKontakError('Kontak harus 10-15 digit angka');
      return;
    }
    try {
      if (editId) {
        await api.put(`/api/penyuplai/${editId}`, form);
        toast.success('Penyuplai berhasil diperbarui');
      } else {
        await api.post('/api/penyuplai', form);
        toast.success('Penyuplai berhasil ditambahkan');
      }
      setShowModal(false);
      setKontakError('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/penyuplai/${deleteId}`);
      toast.success('Penyuplai berhasil dihapus');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus');
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = penyuplai.filter((p) =>
    p.namaPenyuplai.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Penyuplai</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data supplier / penyuplai barang</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
          <Plus className="w-4 h-4" /> Tambah Penyuplai
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Cari penyuplai..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">No</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nama Penyuplai</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Kontak</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Alamat</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item, i) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3 text-sm text-gray-500">{i + 1}</td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-800">{item.namaPenyuplai}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{item.kontak || '-'}</td>
                  <td className="px-6 py-3 text-sm text-gray-500 max-w-xs truncate">{item.alamat || '-'}</td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(item)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(item.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                    Belum ada data penyuplai
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">{editId ? 'Edit Penyuplai' : 'Tambah Penyuplai'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penyuplai</label>
                <input type="text" value={form.namaPenyuplai} onChange={(e) => setForm({ ...form, namaPenyuplai: e.target.value })} required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kontak (No. HP)</label>
                <input type="tel" value={form.kontak} onChange={(e) => handleKontakChange(e.target.value)}
                  placeholder="Contoh: 08123456789" maxLength={15}
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 ${
                    kontakError ? 'border-red-400' : 'border-gray-200'
                  }`} />
                {kontakError && <p className="text-xs text-red-500 mt-1">{kontakError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
                  {editId ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
