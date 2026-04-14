package com.tokoagar.inventori.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PenyuplaiResponse {
    private Long id;
    private String namaPenyuplai;
    private String kontak;
    private String alamat;
}
