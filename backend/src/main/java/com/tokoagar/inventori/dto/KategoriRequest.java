package com.tokoagar.inventori.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KategoriRequest {

    @NotBlank(message = "Nama kategori tidak boleh kosong")
    private String namaKategori;
}
