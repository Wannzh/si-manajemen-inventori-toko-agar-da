package com.tokoagar.inventori.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransaksiKeluarResponse {
    private Long id;
    private LocalDateTime tanggalKeluar;
    private Integer jumlah;
    private String keterangan;
    private Long barangId;
    private String namaBarang;
}
