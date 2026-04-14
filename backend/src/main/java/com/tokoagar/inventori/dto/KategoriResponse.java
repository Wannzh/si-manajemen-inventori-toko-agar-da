package com.tokoagar.inventori.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KategoriResponse {
    private Long id;
    private String namaKategori;
}
