package com.tokoagar.inventori.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransaksiMasukResponse {
    private Long id;
    private LocalDateTime tanggalMasuk;
    private Integer jumlah;
    private String keterangan;
    private Long barangId;
    private String namaBarang;
    private String satuan;
    private Long penyuplaiId;
    private String namaPenyuplai;
    private String status;
    private String catatanReject;
}
