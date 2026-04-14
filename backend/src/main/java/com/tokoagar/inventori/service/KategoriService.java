package com.tokoagar.inventori.service;

import com.tokoagar.inventori.dto.KategoriRequest;
import com.tokoagar.inventori.dto.KategoriResponse;
import com.tokoagar.inventori.entity.Kategori;
import com.tokoagar.inventori.repository.BarangRepository;
import com.tokoagar.inventori.repository.KategoriRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class KategoriService {

    private final KategoriRepository kategoriRepository;
    private final BarangRepository barangRepository;

    public KategoriService(KategoriRepository kategoriRepository, BarangRepository barangRepository) {
        this.kategoriRepository = kategoriRepository;
        this.barangRepository = barangRepository;
    }

    public List<KategoriResponse> getAll() {
        return kategoriRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public KategoriResponse getById(Long id) {
        Kategori kategori = kategoriRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kategori tidak ditemukan"));
        return toResponse(kategori);
    }

    public KategoriResponse create(KategoriRequest request) {
        Kategori kategori = new Kategori();
        kategori.setNamaKategori(request.getNamaKategori());
        return toResponse(kategoriRepository.save(kategori));
    }

    public KategoriResponse update(Long id, KategoriRequest request) {
        Kategori kategori = kategoriRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kategori tidak ditemukan"));
        kategori.setNamaKategori(request.getNamaKategori());
        return toResponse(kategoriRepository.save(kategori));
    }

    public void delete(Long id) {
        if (!kategoriRepository.existsById(id)) {
            throw new RuntimeException("Kategori tidak ditemukan");
        }
        if (barangRepository.existsByKategoriId(id)) {
            throw new RuntimeException("Tidak dapat menghapus kategori karena masih digunakan oleh barang");
        }
        kategoriRepository.deleteById(id);
    }

    private KategoriResponse toResponse(Kategori kategori) {
        return KategoriResponse.builder()
                .id(kategori.getId())
                .namaKategori(kategori.getNamaKategori())
                .build();
    }
}
