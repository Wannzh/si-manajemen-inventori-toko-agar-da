package com.tokoagar.inventori.controller;

import com.tokoagar.inventori.dto.ApiResponse;
import com.tokoagar.inventori.dto.TransaksiKeluarRequest;
import com.tokoagar.inventori.dto.TransaksiKeluarResponse;
import com.tokoagar.inventori.service.TransaksiKeluarService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transaksi-keluar")
public class TransaksiKeluarController {

    private final TransaksiKeluarService transaksiKeluarService;

    public TransaksiKeluarController(TransaksiKeluarService transaksiKeluarService) {
        this.transaksiKeluarService = transaksiKeluarService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TransaksiKeluarResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(transaksiKeluarService.getAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TransaksiKeluarResponse>> create(@Valid @RequestBody TransaksiKeluarRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Barang keluar berhasil dicatat", transaksiKeluarService.create(request)));
    }
}
