package com.tokoagar.inventori.repository;

import com.tokoagar.inventori.entity.TransaksiKeluar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TransaksiKeluarRepository extends JpaRepository<TransaksiKeluar, Long> {

    @Query("SELECT t FROM TransaksiKeluar t WHERE t.tanggalKeluar BETWEEN :start AND :end ORDER BY t.tanggalKeluar DESC")
    List<TransaksiKeluar> findByTanggalKeluarBetween(@Param("start") LocalDateTime start,
                                                     @Param("end") LocalDateTime end);

    @Query("SELECT t FROM TransaksiKeluar t WHERE t.tanggalKeluar BETWEEN :start AND :end AND t.barang.id IN :barangIds ORDER BY t.tanggalKeluar DESC")
    List<TransaksiKeluar> findByTanggalKeluarBetweenAndBarangIdIn(@Param("start") LocalDateTime start,
                                                                  @Param("end") LocalDateTime end,
                                                                  @Param("barangIds") List<Long> barangIds);

    List<TransaksiKeluar> findAllByOrderByTanggalKeluarDesc();

    boolean existsByBarangId(Long barangId);
}
