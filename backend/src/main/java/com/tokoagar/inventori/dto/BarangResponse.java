package com.tokoagar.inventori.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BarangResponse {
    private Long id;
    private String namaBarang;
    private Integer stok;
    private Integer stokMinimum;
    private String satuan;
    private Long kategoriId;
    private String namaKategori;
}
