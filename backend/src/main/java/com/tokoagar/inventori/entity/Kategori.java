package com.tokoagar.inventori.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "kategori")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Kategori {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nama_kategori", nullable = false, length = 100)
    private String namaKategori;
}
