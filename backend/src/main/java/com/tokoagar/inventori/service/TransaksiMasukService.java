package com.tokoagar.inventori.service;

import com.tokoagar.inventori.dto.TransaksiMasukRequest;
import com.tokoagar.inventori.dto.TransaksiMasukResponse;
import com.tokoagar.inventori.entity.Barang;
import com.tokoagar.inventori.entity.Penyuplai;
import com.tokoagar.inventori.entity.TransaksiMasuk;
import com.tokoagar.inventori.repository.BarangRepository;
import com.tokoagar.inventori.repository.PenyuplaiRepository;
import com.tokoagar.inventori.repository.TransaksiMasukRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransaksiMasukService {

    private final TransaksiMasukRepository transaksiMasukRepository;
    private final BarangRepository barangRepository;
    private final PenyuplaiRepository penyuplaiRepository;

    public TransaksiMasukService(TransaksiMasukRepository transaksiMasukRepository,
                                 BarangRepository barangRepository,
                                 PenyuplaiRepository penyuplaiRepository) {
        this.transaksiMasukRepository = transaksiMasukRepository;
        this.barangRepository = barangRepository;
        this.penyuplaiRepository = penyuplaiRepository;
    }

    public List<TransaksiMasukResponse> getAll() {
        return transaksiMasukRepository.findAllByOrderByTanggalMasukDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransaksiMasukResponse create(TransaksiMasukRequest request) {
        Barang barang = barangRepository.findById(request.getBarangId())
                .orElseThrow(() -> new RuntimeException("Barang tidak ditemukan"));

        TransaksiMasuk transaksi = new TransaksiMasuk();
        transaksi.setBarang(barang);
        transaksi.setJumlah(request.getJumlah());
        transaksi.setKeterangan(request.getKeterangan());

        if (request.getPenyuplaiId() != null) {
            Penyuplai penyuplai = penyuplaiRepository.findById(request.getPenyuplaiId())
                    .orElseThrow(() -> new RuntimeException("Penyuplai tidak ditemukan"));
            transaksi.setPenyuplai(penyuplai);
        }

        // Simpan transaksi
        TransaksiMasuk saved = transaksiMasukRepository.save(transaksi);

        // Update stok barang (+)
        barang.setStok(barang.getStok() + request.getJumlah());
        barangRepository.save(barang);

        return toResponse(saved);
    }

    public TransaksiMasukResponse toResponse(TransaksiMasuk t) {
        return TransaksiMasukResponse.builder()
                .id(t.getId())
                .tanggalMasuk(t.getTanggalMasuk())
                .jumlah(t.getJumlah())
                .keterangan(t.getKeterangan())
                .barangId(t.getBarang().getId())
                .namaBarang(t.getBarang().getNamaBarang())
                .penyuplaiId(t.getPenyuplai() != null ? t.getPenyuplai().getId() : null)
                .namaPenyuplai(t.getPenyuplai() != null ? t.getPenyuplai().getNamaPenyuplai() : null)
                .build();
    }
}
