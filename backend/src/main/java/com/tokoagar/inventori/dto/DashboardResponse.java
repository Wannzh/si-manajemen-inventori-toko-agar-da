package com.tokoagar.inventori.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private long totalBarang;
    private long totalKategori;
    private long totalPenyuplai;
    private long totalTransaksiMasuk;
    private long totalTransaksiKeluar;
    private List<BarangResponse> barangStokMinimum;
    private long pendingCount;
    private List<TransaksiMasukResponse> transaksiPending;
    private List<TransaksiMasukResponse> transaksiRejected;
}
