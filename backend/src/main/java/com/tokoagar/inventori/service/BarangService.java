package com.tokoagar.inventori.service;

import com.tokoagar.inventori.dto.BarangRequest;
import com.tokoagar.inventori.dto.BarangResponse;
import com.tokoagar.inventori.entity.Barang;
import com.tokoagar.inventori.entity.Kategori;
import com.tokoagar.inventori.repository.BarangRepository;
import com.tokoagar.inventori.repository.KategoriRepository;
import com.tokoagar.inventori.repository.TransaksiMasukRepository;
import com.tokoagar.inventori.repository.TransaksiKeluarRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BarangService {

    private final BarangRepository barangRepository;
    private final KategoriRepository kategoriRepository;
    private final TransaksiMasukRepository transaksiMasukRepository;
    private final TransaksiKeluarRepository transaksiKeluarRepository;

    public BarangService(BarangRepository barangRepository,
                         KategoriRepository kategoriRepository,
                         TransaksiMasukRepository transaksiMasukRepository,
                         TransaksiKeluarRepository transaksiKeluarRepository) {
        this.barangRepository = barangRepository;
        this.kategoriRepository = kategoriRepository;
        this.transaksiMasukRepository = transaksiMasukRepository;
        this.transaksiKeluarRepository = transaksiKeluarRepository;
    }

    public List<BarangResponse> getAll() {
        return barangRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BarangResponse getById(Long id) {
        Barang barang = barangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Barang tidak ditemukan"));
        return toResponse(barang);
    }

    public BarangResponse create(BarangRequest request) {
        Barang barang = new Barang();
        barang.setNamaBarang(request.getNamaBarang());
        barang.setStok(request.getStok());
        barang.setStokMinimum(request.getStokMinimum());
        barang.setSatuan(request.getSatuan());

        if (request.getKategoriId() != null) {
            Kategori kategori = kategoriRepository.findById(request.getKategoriId())
                    .orElseThrow(() -> new RuntimeException("Kategori tidak ditemukan"));
            barang.setKategori(kategori);
        }

        return toResponse(barangRepository.save(barang));
    }

    public BarangResponse update(Long id, BarangRequest request) {
        Barang barang = barangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Barang tidak ditemukan"));

        barang.setNamaBarang(request.getNamaBarang());
        barang.setStok(request.getStok());
        barang.setStokMinimum(request.getStokMinimum());
        barang.setSatuan(request.getSatuan());

        if (request.getKategoriId() != null) {
            Kategori kategori = kategoriRepository.findById(request.getKategoriId())
                    .orElseThrow(() -> new RuntimeException("Kategori tidak ditemukan"));
            barang.setKategori(kategori);
        } else {
            barang.setKategori(null);
        }

        return toResponse(barangRepository.save(barang));
    }

    public void delete(Long id) {
        Barang barang = barangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Barang tidak ditemukan"));

        boolean adaTransaksiMasuk = transaksiMasukRepository.existsByBarangId(id);
        boolean adaTransaksiKeluar = transaksiKeluarRepository.existsByBarangId(id);

        if (adaTransaksiMasuk || adaTransaksiKeluar) {
            throw new RuntimeException(
                    "Barang \"" + barang.getNamaBarang() +
                    "\" tidak dapat dihapus karena masih memiliki riwayat transaksi");
        }

        barangRepository.deleteById(id);
    }

    public List<BarangResponse> getStokMinimum() {
        return barangRepository.findBarangStokMinimum().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BarangResponse toResponse(Barang barang) {
        return BarangResponse.builder()
                .id(barang.getId())
                .namaBarang(barang.getNamaBarang())
                .stok(barang.getStok())
                .stokMinimum(barang.getStokMinimum())
                .satuan(barang.getSatuan())
                .kategoriId(barang.getKategori() != null ? barang.getKategori().getId() : null)
                .namaKategori(barang.getKategori() != null ? barang.getKategori().getNamaKategori() : null)
                .build();
    }
}
