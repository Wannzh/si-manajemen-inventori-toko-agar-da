package com.tokoagar.inventori.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LaporanHarianResponse {
    private String tanggal;
    private List<TransaksiMasukResponse> transaksiMasuk;
    private List<TransaksiKeluarResponse> transaksiKeluar;
    private int totalMasuk;
    private int totalKeluar;
    private List<BarangLaporanSummary> rekapBarang;
}
