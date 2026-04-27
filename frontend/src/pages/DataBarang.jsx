import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Package, Plus, Pencil, Trash2, X, Loader2, Search } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function DataBarang() {
  const [barang, setBarang] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ namaBarang: '', stok: 0, stokMinimum: 0, satuan: '', kategoriId: '' });
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    document.title = 'Toko Agar D.A | Sistem Inventori';
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resBarang, resKategori] = await Promise.all([
        api.get('/api/barang'),
        api.get('/api/kategori'),
      ]);
      setBarang(resBarang.data.data);
      setKategori(resKategori.data.data);
    } catch (err) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ namaBarang: '', stok: 0, stokMinimum: 0, satuan: '', kategoriId: '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setForm({
      namaBarang: item.namaBarang,
      stok: item.stok,
      stokMinimum: item.stokMinimum,
      satuan: item.satuan,
      kategoriId: item.kategoriId || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.namaBarang?.trim()) { toast.error('Data tidak boleh kosong'); return; }
    if (form.stok === '' || form.stok === null || form.stok === undefined) { toast.error('Data tidak boleh kosong'); return; }
    if (form.stokMinimum === '' || form.stokMinimum === null || form.stokMinimum === undefined) { toast.error('Data tidak boleh kosong'); return; }
    if (!form.satuan?.trim()) { toast.error('Data tidak boleh kosong'); return; }
    if (!form.kategoriId) { toast.error('Data tidak boleh kosong'); return; }
    const payload = {
      ...form,
      stok: parseInt(form.stok),
      stokMinimum: parseInt(form.stokMinimum),
      kategoriId: form.kategoriId ? parseInt(form.kategoriId) : null,
    };
    try {
      if (editId) {
        await api.put(`/api/barang/${editId}`, payload);
        toast.success('Barang berhasil diperbarui');
      } else {
        await api.post('/api/barang', payload);
        toast.success('Barang berhasil ditambahkan');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/barang/${deleteId}`);
      toast.success('Barang berhasil dihapus');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus');
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = barang.filter((b) =>
    b.namaBarang.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-800">Data Barang</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola seluruh data barang inventori</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
          <Plus className="w-4 h-4" /> Tambah Barang
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari barang..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">No</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nama Barang</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Stok</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Min.</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Satuan</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item, i) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3 text-sm text-gray-500">{i + 1}</td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-800">{item.namaBarang}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{item.namaKategori || '-'}</td>
                  <td className="px-6 py-3 text-center">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      item.stok <= item.stokMinimum
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {item.stok}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center text-sm text-gray-500">{item.stokMinimum}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{item.satuan}</td>
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
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                    Tidak ada data barang
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {editId ? 'Edit Barang' : 'Tambah Barang'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang <span className="text-red-500">*</span></label>
                <input type="text" value={form.namaBarang} onChange={(e) => setForm({ ...form, namaBarang: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok <span className="text-red-500">*</span></label>
                  <input type="number" value={form.stok} onChange={(e) => setForm({ ...form, stok: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok Minimum <span className="text-red-500">*</span></label>
                  <input type="number" value={form.stokMinimum} onChange={(e) => setForm({ ...form, stokMinimum: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Satuan <span className="text-red-500">*</span></label>
                  <input type="text" value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori <span className="text-red-500">*</span></label>
                  <select value={form.kategoriId} onChange={(e) => setForm({ ...form, kategoriId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                    <option value="">-- Pilih --</option>
                    {kategori.map((k) => (
                      <option key={k.id} value={k.id}>{k.namaKategori}</option>
                    ))}
                  </select>
                </div>
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
