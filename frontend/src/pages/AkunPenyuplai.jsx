import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { UserPlus, Loader2, Users, Eye, EyeOff } from 'lucide-react';

export default function AkunPenyuplai() {
  const [penyuplaiList, setPenyuplaiList] = useState([]);
  const [akunList, setAkunList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ penyuplaiId: '', username: '', password: '' });

  useEffect(() => {
    document.title = 'Toko Agar D.A | Sistem Inventori';
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resPenyuplai, resUsers] = await Promise.all([
        api.get('/api/penyuplai'),
        api.get('/api/users/penyuplai'),
      ]);
      setPenyuplaiList(resPenyuplai.data.data);
      setAkunList(resUsers.data.data);
    } catch (err) {
      // If /api/users/penyuplai doesn't exist yet, just load penyuplai
      try {
        const resPenyuplai = await api.get('/api/penyuplai');
        setPenyuplaiList(resPenyuplai.data.data);
      } catch (e) {
        toast.error('Gagal memuat data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.penyuplaiId) { toast.error('Penyuplai harus dipilih'); return; }
    if (!form.username?.trim()) { toast.error('Username tidak boleh kosong'); return; }
    if (!form.password?.trim()) { toast.error('Password tidak boleh kosong'); return; }
    if (form.password.length < 6) { toast.error('Password minimal 6 karakter'); return; }

    setSubmitting(true);
    try {
      await api.post('/api/auth/register-penyuplai', {
        penyuplaiId: parseInt(form.penyuplaiId),
        username: form.username,
        password: form.password,
      });
      toast.success('Akun penyuplai berhasil dibuat');
      setForm({ penyuplaiId: '', username: '', password: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat akun');
    } finally {
      setSubmitting(false);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Kelola Akun Penyuplai</h1>
        <p className="text-sm text-gray-500 mt-1">Buat akun login untuk setiap penyuplai</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-800">Buat Akun Penyuplai</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Penyuplai <span className="text-red-500">*</span>
                </label>
                <select value={form.penyuplaiId} onChange={(e) => setForm({ ...form, penyuplaiId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                  <option value="">-- Pilih Penyuplai --</option>
                  {penyuplaiList.map((p) => (
                    <option key={p.id} value={p.id}>{p.namaPenyuplai}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Masukkan username"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-70">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-4 h-4" /> Buat Akun</>}
              </button>
            </form>
          </div>
        </div>

        {/* Table */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-400" />
              <h3 className="text-base font-semibold text-gray-800">Daftar Akun Penyuplai</h3>
              {akunList.length > 0 && (
                <span className="ml-auto px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                  {akunList.length} akun
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nama Penyuplai</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tanggal Dibuat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {akunList.map((akun) => (
                    <tr key={akun.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 text-sm font-medium text-gray-800">{akun.username}</td>
                      <td className="px-6 py-3 text-sm text-gray-500">{akun.namaPenyuplai || '-'}</td>
                      <td className="px-6 py-3 text-xs text-gray-500">
                        {akun.createdAt ? new Date(akun.createdAt).toLocaleDateString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        }) : '-'}
                      </td>
                    </tr>
                  ))}
                  {akunList.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400 text-sm">Belum ada akun penyuplai</td></tr>
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
