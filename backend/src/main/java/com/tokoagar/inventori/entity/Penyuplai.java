package com.tokoagar.inventori.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "penyuplai")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Penyuplai {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nama_penyuplai", nullable = false, length = 150)
    private String namaPenyuplai;

    @Column(length = 50)
    private String kontak;

    @Column(columnDefinition = "TEXT")
    private String alamat;
}
