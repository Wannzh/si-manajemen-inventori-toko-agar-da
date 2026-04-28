import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Store,
  LogOut,
  Clock,
  History,
  CheckCircle2,
  XCircle,
  Loader2,
  Package,
} from 'lucide-react';

export default function PenyuplaiDashboard() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectCatatan, setRejectCatatan] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    document.title = 'Toko Agar D.A | Penyuplai';
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resPending, resHistory] = await Promise.all([
        api.get('/api/penyuplai-approval/pending'),
        api.get('/api/penyuplai-approval/history'),
      ]);
      setPending(resPending.data.data);
      setHistory(resHistory.data.data);
    } catch (err) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessing(id);
    try {
      await api.put(`/api/penyuplai-approval/${id}/approve`);
      toast.success('Transaksi berhasil disetujui');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyetujui');
    } finally {
      setProcessing(null);
    }
  };

  const openRejectModal = (item) => {
    setRejectTarget(item);
    setRejectCatatan('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectCatatan.trim()) {
      toast.error('Masukkan alasan penolakan');
      return;
    }
    setProcessing(rejectTarget.id);
    try {
      await api.put(`/api/penyuplai-approval/${rejectTarget.id}/reject`, {
        catatan: rejectCatatan,
      });
      toast.success('Transaksi berhasil ditolak');
      setShowRejectModal(false);
      setRejectTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menolak');
    } finally {
      setProcessing(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-800 to-primary-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-primary-200" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Toko Agar D.A.</h1>
              <p className="text-xs text-primary-300">Portal Penyuplai</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-primary-200 hidden sm:block">
              Halo, <strong className="text-white">{username}</strong>
            </span>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Selamat datang, {username}</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola transaksi barang masuk yang memerlukan persetujuan Anda</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setTab('pending')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'pending'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            Menunggu Approval
            {pending.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                {pending.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'history'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <History className="w-4 h-4" />
            Riwayat
          </button>
        </div>

        {/* Tab: Pending */}
        {tab === 'pending' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nama Barang</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Jumlah</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Satuan</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Keterangan</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pending.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 text-xs text-gray-500">{formatDate(item.tanggalMasuk)}</td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-800">{item.namaBarang}</td>
                      <td className="px-6 py-3 text-center">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">+{item.jumlah}</span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">{item.satuan || '-'}</td>
                      <td className="px-6 py-3 text-sm text-gray-500 max-w-xs truncate">{item.keterangan || '-'}</td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(item.id)}
                            disabled={processing === item.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {processing === item.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => openRejectModal(item)}
                            disabled={processing === item.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Tolak
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pending.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm text-gray-400">Tidak ada transaksi yang menunggu persetujuan</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: History */}
        {tab === 'history' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Barang</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Jumlah</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 text-xs text-gray-500">{formatDate(item.tanggalMasuk)}</td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-800">{item.namaBarang}</td>
                      <td className="px-6 py-3 text-center">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">+{item.jumlah}</span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        {item.status === 'APPROVED' && (
                          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Disetujui</span>
                        )}
                        {item.status === 'REJECTED' && (
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Ditolak</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500 max-w-xs truncate">{item.catatanReject || '-'}</td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm text-gray-400">Belum ada riwayat transaksi</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800">Tolak Transaksi</h3>
                <p className="text-xs text-gray-500">
                  {rejectTarget?.namaBarang} — {rejectTarget?.jumlah} {rejectTarget?.satuan}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alasan Penolakan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectCatatan}
                onChange={(e) => setRejectCatatan(e.target.value)}
                rows={3}
                placeholder="Masukkan alasan penolakan..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setShowRejectModal(false); setRejectTarget(null); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Konfirmasi Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
