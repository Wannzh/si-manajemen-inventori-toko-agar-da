package com.tokoagar.inventori.service;

import com.tokoagar.inventori.dto.TransaksiKeluarRequest;
import com.tokoagar.inventori.dto.TransaksiKeluarResponse;
import com.tokoagar.inventori.entity.Barang;
import com.tokoagar.inventori.entity.TransaksiKeluar;
import com.tokoagar.inventori.repository.BarangRepository;
import com.tokoagar.inventori.repository.TransaksiKeluarRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransaksiKeluarService {

    private final TransaksiKeluarRepository transaksiKeluarRepository;
    private final BarangRepository barangRepository;

    public TransaksiKeluarService(TransaksiKeluarRepository transaksiKeluarRepository,
                                  BarangRepository barangRepository) {
        this.transaksiKeluarRepository = transaksiKeluarRepository;
        this.barangRepository = barangRepository;
    }

    public List<TransaksiKeluarResponse> getAll() {
        return transaksiKeluarRepository.findAllByOrderByTanggalKeluarDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransaksiKeluarResponse create(TransaksiKeluarRequest request) {
        Barang barang = barangRepository.findById(request.getBarangId())
                .orElseThrow(() -> new RuntimeException("Barang tidak ditemukan"));

        // Validasi: jumlah keluar tidak boleh melebihi stok
        if (barang.getStok() < request.getJumlah()) {
            throw new RuntimeException("Stok tidak mencukupi. Stok tersedia: " + barang.getStok());
        }

        TransaksiKeluar transaksi = new TransaksiKeluar();
        transaksi.setBarang(barang);
        transaksi.setJumlah(request.getJumlah());
        transaksi.setKeterangan(request.getKeterangan());

        // Simpan transaksi
        TransaksiKeluar saved = transaksiKeluarRepository.save(transaksi);

        // Update stok barang (-)
        barang.setStok(barang.getStok() - request.getJumlah());
        barangRepository.save(barang);

        return toResponse(saved);
    }

    public TransaksiKeluarResponse toResponse(TransaksiKeluar t) {
        return TransaksiKeluarResponse.builder()
                .id(t.getId())
                .tanggalKeluar(t.getTanggalKeluar())
                .jumlah(t.getJumlah())
                .keterangan(t.getKeterangan())
                .barangId(t.getBarang().getId())
                .namaBarang(t.getBarang().getNamaBarang())
                .build();
    }
}
