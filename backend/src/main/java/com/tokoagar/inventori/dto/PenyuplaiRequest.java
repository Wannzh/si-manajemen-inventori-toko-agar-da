package com.tokoagar.inventori.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PenyuplaiRequest {

    @NotBlank(message = "Nama penyuplai tidak boleh kosong")
    private String namaPenyuplai;

    private String kontak;
    private String alamat;
}
