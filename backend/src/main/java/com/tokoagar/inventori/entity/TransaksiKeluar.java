package com.tokoagar.inventori.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaksi_keluar")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransaksiKeluar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tanggal_keluar", nullable = false)
    private LocalDateTime tanggalKeluar;

    @Column(nullable = false)
    private Integer jumlah;

    @Column(columnDefinition = "TEXT")
    private String keterangan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barang_id", nullable = false)
    private Barang barang;

    @PrePersist
    protected void onCreate() {
        if (this.tanggalKeluar == null) {
            this.tanggalKeluar = LocalDateTime.now();
        }
    }
}
