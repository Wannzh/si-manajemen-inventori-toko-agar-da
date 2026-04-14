package com.tokoagar.inventori.controller;

import com.tokoagar.inventori.dto.ApiResponse;
import com.tokoagar.inventori.dto.PenyuplaiRequest;
import com.tokoagar.inventori.dto.PenyuplaiResponse;
import com.tokoagar.inventori.service.PenyuplaiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/penyuplai")
public class PenyuplaiController {

    private final PenyuplaiService penyuplaiService;

    public PenyuplaiController(PenyuplaiService penyuplaiService) {
        this.penyuplaiService = penyuplaiService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PenyuplaiResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(penyuplaiService.getAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PenyuplaiResponse>> create(@Valid @RequestBody PenyuplaiRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Penyuplai berhasil ditambahkan", penyuplaiService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PenyuplaiResponse>> update(@PathVariable Long id,
                                                                  @Valid @RequestBody PenyuplaiRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Penyuplai berhasil diperbarui", penyuplaiService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        penyuplaiService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Penyuplai berhasil dihapus", null));
    }
}
