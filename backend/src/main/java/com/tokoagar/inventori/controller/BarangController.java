package com.tokoagar.inventori.controller;

import com.tokoagar.inventori.dto.ApiResponse;
import com.tokoagar.inventori.dto.BarangRequest;
import com.tokoagar.inventori.dto.BarangResponse;
import com.tokoagar.inventori.service.BarangService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/barang")
public class BarangController {

    private final BarangService barangService;

    public BarangController(BarangService barangService) {
        this.barangService = barangService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BarangResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(barangService.getAll()));
    }

    @GetMapping("/stok-minimum")
    public ResponseEntity<ApiResponse<List<BarangResponse>>> getStokMinimum() {
        return ResponseEntity.ok(ApiResponse.success(barangService.getStokMinimum()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BarangResponse>> create(@Valid @RequestBody BarangRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Barang berhasil ditambahkan", barangService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BarangResponse>> update(@PathVariable Long id,
                                                               @Valid @RequestBody BarangRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Barang berhasil diperbarui", barangService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            barangService.delete(id);
            return ResponseEntity.ok(ApiResponse.success("Barang berhasil dihapus", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
