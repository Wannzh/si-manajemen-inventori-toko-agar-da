package com.tokoagar.inventori.controller;

import com.tokoagar.inventori.dto.ApiResponse;
import com.tokoagar.inventori.dto.TransaksiMasukRequest;
import com.tokoagar.inventori.dto.TransaksiMasukResponse;
import com.tokoagar.inventori.service.TransaksiMasukService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transaksi-masuk")
public class TransaksiMasukController {

    private final TransaksiMasukService transaksiMasukService;

    public TransaksiMasukController(TransaksiMasukService transaksiMasukService) {
        this.transaksiMasukService = transaksiMasukService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TransaksiMasukResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(transaksiMasukService.getAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TransaksiMasukResponse>> create(@Valid @RequestBody TransaksiMasukRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Barang masuk berhasil dicatat", transaksiMasukService.create(request)));
    }
}
