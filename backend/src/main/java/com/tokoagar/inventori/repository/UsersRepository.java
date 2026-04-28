package com.tokoagar.inventori.repository;

import com.tokoagar.inventori.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsersRepository extends JpaRepository<Users, Long> {
    Optional<Users> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByPenyuplaiId(Long penyuplaiId);
    List<Users> findByRole(String role);
}
