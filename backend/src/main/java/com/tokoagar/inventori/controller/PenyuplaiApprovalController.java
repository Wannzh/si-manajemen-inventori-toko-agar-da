package com.tokoagar.inventori.controller;

import com.tokoagar.inventori.dto.ApiResponse;
import com.tokoagar.inventori.dto.RejectRequest;
import com.tokoagar.inventori.dto.TransaksiMasukResponse;
import com.tokoagar.inventori.entity.Users;
import com.tokoagar.inventori.repository.UsersRepository;
import com.tokoagar.inventori.service.PenyuplaiApprovalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/penyuplai-approval")
public class PenyuplaiApprovalController {

    private final PenyuplaiApprovalService approvalService;
    private final UsersRepository usersRepository;

    public PenyuplaiApprovalController(PenyuplaiApprovalService approvalService,
                                       UsersRepository usersRepository) {
        this.approvalService = approvalService;
        this.usersRepository = usersRepository;
    }

    private Long getPenyuplaiIdFromAuth() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = usersRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));
        if (user.getPenyuplai() == null) {
            throw new RuntimeException("User tidak terkait dengan penyuplai");
        }
        return user.getPenyuplai().getId();
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<TransaksiMasukResponse>>> getPending() {
        Long penyuplaiId = getPenyuplaiIdFromAuth();
        return ResponseEntity.ok(ApiResponse.success(approvalService.getPending(penyuplaiId)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<TransaksiMasukResponse>>> getHistory() {
        Long penyuplaiId = getPenyuplaiIdFromAuth();
        return ResponseEntity.ok(ApiResponse.success(approvalService.getHistory(penyuplaiId)));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        try {
            Long penyuplaiId = getPenyuplaiIdFromAuth();
            TransaksiMasukResponse response = approvalService.approve(id, penyuplaiId);
            return ResponseEntity.ok(ApiResponse.success("Transaksi berhasil disetujui", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id, @RequestBody RejectRequest request) {
        try {
            Long penyuplaiId = getPenyuplaiIdFromAuth();
            TransaksiMasukResponse response = approvalService.reject(id, penyuplaiId, request.getCatatan());
            return ResponseEntity.ok(ApiResponse.success("Transaksi berhasil ditolak", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
