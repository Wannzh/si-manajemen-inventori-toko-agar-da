package com.tokoagar.inventori.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BarangRequest {

    @NotBlank(message = "Nama barang tidak boleh kosong")
    private String namaBarang;

    @NotNull(message = "Stok tidak boleh kosong")
    @Min(value = 0, message = "Stok minimal 0")
    private Integer stok;

    @NotNull(message = "Stok minimum tidak boleh kosong")
    @Min(value = 0, message = "Stok minimum minimal 0")
    private Integer stokMinimum;

    @NotBlank(message = "Satuan tidak boleh kosong")
    private String satuan;

    private Long kategoriId;
}
