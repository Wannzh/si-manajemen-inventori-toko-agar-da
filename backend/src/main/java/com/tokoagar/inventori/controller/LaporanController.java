package com.tokoagar.inventori.controller;

import com.tokoagar.inventori.dto.*;
import com.tokoagar.inventori.service.LaporanService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class LaporanController {

    private final LaporanService laporanService;

    public LaporanController(LaporanService laporanService) {
        this.laporanService = laporanService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(laporanService.getDashboard()));
    }

    @GetMapping("/laporan/harian")
    public ResponseEntity<ApiResponse<LaporanHarianResponse>> getLaporanHarian(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tanggal,
            @RequestParam(required = false) Long penyuplaiId) {
        return ResponseEntity.ok(ApiResponse.success(laporanService.getLaporanHarian(tanggal, penyuplaiId)));
    }

    @GetMapping("/laporan/export/pdf")
    public void exportPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tanggal,
            @RequestParam(required = false) Long penyuplaiId,
            HttpServletResponse response) throws IOException {
        byte[] pdfBytes = laporanService.exportPdf(tanggal, penyuplaiId);

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition",
                "attachment; filename=laporan-harian-" + tanggal + ".pdf");
        response.setContentLength(pdfBytes.length);
        response.getOutputStream().write(pdfBytes);
        response.getOutputStream().flush();
    }

    @GetMapping("/laporan/export/excel")
    public void exportExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tanggal,
            @RequestParam(required = false) Long penyuplaiId,
            HttpServletResponse response) throws IOException {
        byte[] excelBytes = laporanService.exportExcel(tanggal, penyuplaiId);

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition",
                "attachment; filename=laporan-harian-" + tanggal + ".xlsx");
        response.setContentLength(excelBytes.length);
        response.getOutputStream().write(excelBytes);
        response.getOutputStream().flush();
    }

    @GetMapping("/riwayat")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRiwayat(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tanggal_mulai,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tanggal_akhir,
            @RequestParam(required = false, defaultValue = "semua") String jenis) {

        Map<String, Object> result = new HashMap<>();

        if ("masuk".equals(jenis)) {
            result.put("transaksiMasuk", laporanService.getRiwayatMasuk(tanggal_mulai, tanggal_akhir));
            result.put("transaksiKeluar", new ArrayList<>());
        } else if ("keluar".equals(jenis)) {
            result.put("transaksiMasuk", new ArrayList<>());
            result.put("transaksiKeluar", laporanService.getRiwayatKeluar(tanggal_mulai, tanggal_akhir));
        } else {
            result.put("transaksiMasuk", laporanService.getRiwayatMasuk(tanggal_mulai, tanggal_akhir));
            result.put("transaksiKeluar", laporanService.getRiwayatKeluar(tanggal_mulai, tanggal_akhir));
        }

        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
