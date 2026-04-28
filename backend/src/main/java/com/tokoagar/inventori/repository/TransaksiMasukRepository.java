package com.tokoagar.inventori.repository;

import com.tokoagar.inventori.entity.TransaksiMasuk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TransaksiMasukRepository extends JpaRepository<TransaksiMasuk, Long> {

    @Query("SELECT t FROM TransaksiMasuk t WHERE t.tanggalMasuk BETWEEN :start AND :end AND t.status = 'APPROVED' ORDER BY t.tanggalMasuk DESC")
    List<TransaksiMasuk> findByTanggalMasukBetween(@Param("start") LocalDateTime start,
                                                   @Param("end") LocalDateTime end);

    @Query("SELECT t FROM TransaksiMasuk t WHERE t.tanggalMasuk BETWEEN :start AND :end AND t.penyuplai.id = :penyuplaiId AND t.status = 'APPROVED' ORDER BY t.tanggalMasuk DESC")
    List<TransaksiMasuk> findByTanggalMasukBetweenAndPenyuplaiId(@Param("start") LocalDateTime start,
                                                                 @Param("end") LocalDateTime end,
                                                                 @Param("penyuplaiId") Long penyuplaiId);

    boolean existsByPenyuplaiId(Long penyuplaiId);

    boolean existsByBarangId(Long barangId);

    @Query("SELECT t FROM TransaksiMasuk t WHERE t.status = 'APPROVED' ORDER BY t.tanggalMasuk DESC")
    List<TransaksiMasuk> findAllByOrderByTanggalMasukDesc();

    List<TransaksiMasuk> findByStatus(String status);

    List<TransaksiMasuk> findByStatusAndPenyuplaiIdOrderByTanggalMasukDesc(String status, Long penyuplaiId);

    List<TransaksiMasuk> findByStatusInAndPenyuplaiIdOrderByTanggalMasukDesc(List<String> statuses, Long penyuplaiId);

    @Query("SELECT t FROM TransaksiMasuk t ORDER BY t.tanggalMasuk DESC")
    List<TransaksiMasuk> findAllIncludingPending();

    @Query("SELECT COUNT(t) FROM TransaksiMasuk t WHERE t.status = 'APPROVED'")
    long countApproved();
}
