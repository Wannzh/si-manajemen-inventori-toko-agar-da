package com.tokoagar.inventori.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaksi_masuk")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransaksiMasuk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tanggal_masuk", nullable = false)
    private LocalDateTime tanggalMasuk;

    @Column(nullable = false)
    private Integer jumlah;

    @Column(columnDefinition = "TEXT")
    private String keterangan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barang_id", nullable = false)
    private Barang barang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "penyuplai_id")
    private Penyuplai penyuplai;

    @PrePersist
    protected void onCreate() {
        if (this.tanggalMasuk == null) {
            this.tanggalMasuk = LocalDateTime.now();
        }
    }
}
