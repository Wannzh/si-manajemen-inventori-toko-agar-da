package com.tokoagar.inventori.service;

import com.tokoagar.inventori.dto.PenyuplaiRequest;
import com.tokoagar.inventori.dto.PenyuplaiResponse;
import com.tokoagar.inventori.entity.Penyuplai;
import com.tokoagar.inventori.repository.PenyuplaiRepository;
import com.tokoagar.inventori.repository.TransaksiMasukRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PenyuplaiService {

    private final PenyuplaiRepository penyuplaiRepository;
    private final TransaksiMasukRepository transaksiMasukRepository;

    public PenyuplaiService(PenyuplaiRepository penyuplaiRepository,
                            TransaksiMasukRepository transaksiMasukRepository) {
        this.penyuplaiRepository = penyuplaiRepository;
        this.transaksiMasukRepository = transaksiMasukRepository;
    }

    public List<PenyuplaiResponse> getAll() {
        return penyuplaiRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PenyuplaiResponse getById(Long id) {
        Penyuplai penyuplai = penyuplaiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Penyuplai tidak ditemukan"));
        return toResponse(penyuplai);
    }

    public PenyuplaiResponse create(PenyuplaiRequest request) {
        Penyuplai penyuplai = new Penyuplai();
        penyuplai.setNamaPenyuplai(request.getNamaPenyuplai());
        penyuplai.setKontak(request.getKontak());
        penyuplai.setAlamat(request.getAlamat());
        return toResponse(penyuplaiRepository.save(penyuplai));
    }

    public PenyuplaiResponse update(Long id, PenyuplaiRequest request) {
        Penyuplai penyuplai = penyuplaiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Penyuplai tidak ditemukan"));
        penyuplai.setNamaPenyuplai(request.getNamaPenyuplai());
        penyuplai.setKontak(request.getKontak());
        penyuplai.setAlamat(request.getAlamat());
        return toResponse(penyuplaiRepository.save(penyuplai));
    }

    public void delete(Long id) {
        if (!penyuplaiRepository.existsById(id)) {
            throw new RuntimeException("Penyuplai tidak ditemukan");
        }
        if (transaksiMasukRepository.existsByPenyuplaiId(id)) {
            throw new RuntimeException("Tidak dapat menghapus penyuplai karena masih ada riwayat transaksi");
        }
        penyuplaiRepository.deleteById(id);
    }

    private PenyuplaiResponse toResponse(Penyuplai p) {
        return PenyuplaiResponse.builder()
                .id(p.getId())
                .namaPenyuplai(p.getNamaPenyuplai())
                .kontak(p.getKontak())
                .alamat(p.getAlamat())
                .build();
    }
}
