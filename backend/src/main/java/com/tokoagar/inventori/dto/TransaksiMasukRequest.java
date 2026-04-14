package com.tokoagar.inventori.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TransaksiMasukRequest {

    @NotNull(message = "Barang ID tidak boleh kosong")
    private Long barangId;

    private Long penyuplaiId;

    @NotNull(message = "Jumlah tidak boleh kosong")
    @Min(value = 1, message = "Jumlah minimal 1")
    private Integer jumlah;

    private String keterangan;
}
