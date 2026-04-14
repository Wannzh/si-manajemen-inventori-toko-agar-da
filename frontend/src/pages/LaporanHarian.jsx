import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  FileText, Search, Loader2, ArrowDownToLine, ArrowUpFromLine,
  MessageCircle, Download, FileSpreadsheet,
} from 'lucide-react';

export default function LaporanHarian() {
  const [loading, setLoading] = useState(false);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [laporan, setLaporan] = useState(null);
  const [penyuplaiList, setPenyuplaiList] = useState([]);
  const [selectedPenyuplaiId, setSelectedPenyuplaiId] = useState('');
  const [selectedPenyuplai, setSelectedPenyuplai] = useState(null);

  useEffect(() => {
    document.title = 'Toko Agar D.A | Sistem Inventori';
    fetchPenyuplai();
  }, []);

  const fetchPenyuplai = async () => {
    try {
      const res = await api.get('/api/penyuplai');
      setPenyuplaiList(res.data.data);
    } catch (err) {
      // silent
    }
  };

  const handlePenyuplaiChange = (value) => {
    setSelectedPenyuplaiId(value);
    if (value) {
      const found = penyuplaiList.find((p) => p.id === parseInt(value));
      setSelectedPenyuplai(found || null);
    } else {
      setSelectedPenyuplai(null);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = { tanggal };
      if (selectedPenyuplaiId) {
        params.penyuplaiId = parseInt(selectedPenyuplaiId);
      }
      const res = await api.get('/api/laporan/harian', { params });
      setLaporan(res.data.data);
    } catch (err) {
      toast.error('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const formatTanggalDisplay = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const shareWhatsApp = () => {
    if (!laporan || !laporan.rekapBarang || laporan.rekapBarang.length === 0) {
      toast.error('Tidak ada data untuk dibagikan');
      return;
    }

    const tanggalStr = formatTanggalDisplay(laporan.tanggal);

    let message = `*LAPORAN STOK HARIAN - TOKO AGAR D.A*\n`;
    if (selectedPenyuplai) {
      message += `Kepada: ${selectedPenyuplai.namaPenyuplai}\n`;
    }
    message += `Tanggal: ${tanggalStr}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `*REKAP BARANG:*\n`;

    laporan.rekapBarang.forEach((item) => {
      message += `${item.namaBarang}\n`;
      message += `  Masuk pagi  : ${item.totalMasuk} ${item.satuan}\n`;
      message += `  Terjual     : ${item.totalKeluar} ${item.satuan}\n`;
      message += `  Sisa stok   : ${item.stokSaatIni} ${item.satuan}\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `Mohon kirim besok sesuai sisa stok.\n`;
    message += `Terima kasih.`;

    // Build WhatsApp URL
    let waUrl;
    if (selectedPenyuplai?.kontak) {
      let nomor = selectedPenyuplai.kontak;
      // Hilangkan 0 pertama, ganti dengan 62
      if (nomor.startsWith('0')) {
        nomor = '62' + nomor.substring(1);
      }
      waUrl = `https://wa.me/${nomor}?text=${encodeURIComponent(message)}`;
    } else {
      waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    }

    window.open(waUrl, '_blank');
  };

  const handleExportPdf = async () => {
    try {
      const params = { tanggal };
      if (selectedPenyuplaiId) params.penyuplaiId = parseInt(selectedPenyuplaiId);
      const response = await api.get('/api/laporan/export/pdf', {
        params,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-harian-${tanggal}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF berhasil diunduh');
    } catch (err) {
      toast.error('Gagal mengunduh PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const params = { tanggal };
      if (selectedPenyuplaiId) params.penyuplaiId = parseInt(selectedPenyuplaiId);
      const response = await api.get('/api/laporan/export/excel', {
        params,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-harian-${tanggal}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel berhasil diunduh');
    } catch (err) {
      toast.error('Gagal mengunduh Excel');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Laporan Harian</h1>
        <p className="text-sm text-gray-500 mt-1">Lihat ringkasan transaksi harian, export, dan bagikan via WhatsApp</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Tanggal</label>
            <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Penyuplai</label>
            <select value={selectedPenyuplaiId} onChange={(e) => handlePenyuplaiChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
              <option value="">-- Semua Penyuplai --</option>
              {penyuplaiList.map((p) => (
                <option key={p.id} value={p.id}>{p.namaPenyuplai}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-70">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Lihat Laporan
          </button>
        </form>
      </div>

      {/* Report */}
      {laporan && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm text-gray-500 mb-1">Tanggal Laporan</p>
              <p className="text-lg font-bold text-gray-800">{formatTanggalDisplay(laporan.tanggal)}</p>
              {selectedPenyuplai && (
                <p className="text-xs text-primary-600 mt-1">Penyuplai: {selectedPenyuplai.namaPenyuplai}</p>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownToLine className="w-4 h-4 text-green-500" />
                <p className="text-sm text-gray-500">Total Masuk</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{laporan.totalMasuk}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpFromLine className="w-4 h-4 text-red-500" />
                <p className="text-sm text-gray-500">Total Keluar</p>
              </div>
              <p className="text-2xl font-bold text-red-600">{laporan.totalKeluar}</p>
            </div>
          </div>

          {/* Rekap Barang */}
          {laporan.rekapBarang?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-800">Rekap Barang</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Barang</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Masuk</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Keluar</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Sisa Stok</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Satuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {laporan.rekapBarang.map((item) => (
                      <tr key={item.barangId} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3 text-sm font-medium text-gray-800">{item.namaBarang}</td>
                        <td className="px-6 py-3 text-center">
                          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">+{item.totalMasuk}</span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">-{item.totalKeluar}</span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{item.stokSaatIni}</span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">{item.satuan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transaksi Masuk */}
          {laporan.transaksiMasuk.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <ArrowDownToLine className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-800">Detail Barang Masuk</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Waktu</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Barang</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Jumlah</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Penyuplai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {laporan.transaksiMasuk.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3 text-sm text-gray-500">{formatDate(item.tanggalMasuk)}</td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-800">{item.namaBarang}</td>
                        <td className="px-6 py-3 text-center">
                          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">+{item.jumlah}</span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">{item.namaPenyuplai || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transaksi Keluar */}
          {laporan.transaksiKeluar.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                  <ArrowUpFromLine className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-800">Detail Barang Keluar</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Waktu</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Barang</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Jumlah</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {laporan.transaksiKeluar.map((item) => (
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

          {/* Empty */}
          {laporan.transaksiMasuk.length === 0 && laporan.transaksiKeluar.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-400">Tidak ada transaksi pada tanggal ini</p>
            </div>
          )}

          {/* Action Buttons */}
          {(laporan.transaksiMasuk.length > 0 || laporan.transaksiKeluar.length > 0) && (
            <div className="flex flex-wrap justify-end gap-3">
              <button onClick={handleExportPdf}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 text-sm">
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <button onClick={handleExportExcel}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 text-sm">
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </button>
              {selectedPenyuplai && (
                <button onClick={shareWhatsApp}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20 text-sm">
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp ke {selectedPenyuplai.namaPenyuplai}
                </button>
              )}
              {!selectedPenyuplai && (
                <button onClick={shareWhatsApp}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20 text-sm">
                  <MessageCircle className="w-5 h-5" />
                  Bagikan via WhatsApp
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
