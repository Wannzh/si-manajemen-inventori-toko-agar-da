package com.tokoagar.inventori.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BarangLaporanSummary {
    private Long barangId;
    private String namaBarang;
    private String satuan;
    private int totalMasuk;
    private int totalKeluar;
    private int stokSaatIni;
}
