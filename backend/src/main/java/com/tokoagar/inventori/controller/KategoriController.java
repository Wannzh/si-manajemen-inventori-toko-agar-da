package com.tokoagar.inventori.controller;

import com.tokoagar.inventori.dto.ApiResponse;
import com.tokoagar.inventori.dto.KategoriRequest;
import com.tokoagar.inventori.dto.KategoriResponse;
import com.tokoagar.inventori.service.KategoriService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kategori")
public class KategoriController {

    private final KategoriService kategoriService;

    public KategoriController(KategoriService kategoriService) {
        this.kategoriService = kategoriService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<KategoriResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(kategoriService.getAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<KategoriResponse>> create(@Valid @RequestBody KategoriRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Kategori berhasil ditambahkan", kategoriService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<KategoriResponse>> update(@PathVariable Long id,
                                                                 @Valid @RequestBody KategoriRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Kategori berhasil diperbarui", kategoriService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        kategoriService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Kategori berhasil dihapus", null));
    }
}
