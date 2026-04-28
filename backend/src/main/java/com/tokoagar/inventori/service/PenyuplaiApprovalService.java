package com.tokoagar.inventori.service;

import com.tokoagar.inventori.dto.TransaksiMasukResponse;
import com.tokoagar.inventori.entity.Barang;
import com.tokoagar.inventori.entity.TransaksiMasuk;
import com.tokoagar.inventori.repository.BarangRepository;
import com.tokoagar.inventori.repository.TransaksiMasukRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PenyuplaiApprovalService {

    private final TransaksiMasukRepository transaksiMasukRepository;
    private final BarangRepository barangRepository;
    private final TransaksiMasukService transaksiMasukService;

    public PenyuplaiApprovalService(TransaksiMasukRepository transaksiMasukRepository,
                                    BarangRepository barangRepository,
                                    TransaksiMasukService transaksiMasukService) {
        this.transaksiMasukRepository = transaksiMasukRepository;
        this.barangRepository = barangRepository;
        this.transaksiMasukService = transaksiMasukService;
    }

    public List<TransaksiMasukResponse> getPending(Long penyuplaiId) {
        return transaksiMasukRepository
                .findByStatusAndPenyuplaiIdOrderByTanggalMasukDesc("PENDING", penyuplaiId)
                .stream()
                .map(transaksiMasukService::toResponse)
                .collect(Collectors.toList());
    }

    public List<TransaksiMasukResponse> getHistory(Long penyuplaiId) {
        return transaksiMasukRepository
                .findByStatusInAndPenyuplaiIdOrderByTanggalMasukDesc(
                        Arrays.asList("APPROVED", "REJECTED"), penyuplaiId)
                .stream()
                .map(transaksiMasukService::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransaksiMasukResponse approve(Long transaksiId, Long penyuplaiId) {
        TransaksiMasuk transaksi = transaksiMasukRepository.findById(transaksiId)
                .orElseThrow(() -> new RuntimeException("Transaksi tidak ditemukan"));

        if (transaksi.getPenyuplai() == null || !transaksi.getPenyuplai().getId().equals(penyuplaiId)) {
            throw new RuntimeException("Anda tidak memiliki akses ke transaksi ini");
        }

        if (!"PENDING".equals(transaksi.getStatus())) {
            throw new RuntimeException("Transaksi ini sudah diproses sebelumnya");
        }

        transaksi.setStatus("APPROVED");
        transaksiMasukRepository.save(transaksi);

        // Update stok barang
        Barang barang = transaksi.getBarang();
        barang.setStok(barang.getStok() + transaksi.getJumlah());
        barangRepository.save(barang);

        return transaksiMasukService.toResponse(transaksi);
    }

    @Transactional
    public TransaksiMasukResponse reject(Long transaksiId, Long penyuplaiId, String catatan) {
        TransaksiMasuk transaksi = transaksiMasukRepository.findById(transaksiId)
                .orElseThrow(() -> new RuntimeException("Transaksi tidak ditemukan"));

        if (transaksi.getPenyuplai() == null || !transaksi.getPenyuplai().getId().equals(penyuplaiId)) {
            throw new RuntimeException("Anda tidak memiliki akses ke transaksi ini");
        }

        if (!"PENDING".equals(transaksi.getStatus())) {
            throw new RuntimeException("Transaksi ini sudah diproses sebelumnya");
        }

        transaksi.setStatus("REJECTED");
        transaksi.setCatatanReject(catatan);
        transaksiMasukRepository.save(transaksi);

        return transaksiMasukService.toResponse(transaksi);
    }
}
