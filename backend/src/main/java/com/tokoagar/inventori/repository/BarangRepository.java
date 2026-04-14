package com.tokoagar.inventori.repository;

import com.tokoagar.inventori.entity.Barang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BarangRepository extends JpaRepository<Barang, Long> {

    boolean existsByKategoriId(Long kategoriId);

    @Query("SELECT b FROM Barang b WHERE b.stok <= b.stokMinimum")
    List<Barang> findBarangStokMinimum();
}
