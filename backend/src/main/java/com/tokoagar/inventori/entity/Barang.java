package com.tokoagar.inventori.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "barang")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Barang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nama_barang", nullable = false, length = 150)
    private String namaBarang;

    @Column(nullable = false)
    private Integer stok = 0;

    @Column(name = "stok_minimum", nullable = false)
    private Integer stokMinimum = 0;

    @Column(nullable = false, length = 30)
    private String satuan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kategori_id")
    private Kategori kategori;
}
