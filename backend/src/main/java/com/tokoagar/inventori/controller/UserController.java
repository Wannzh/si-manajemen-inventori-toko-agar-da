package com.tokoagar.inventori.controller;

import com.tokoagar.inventori.dto.ApiResponse;
import com.tokoagar.inventori.entity.Users;
import com.tokoagar.inventori.repository.UsersRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UsersRepository usersRepository;

    public UserController(UsersRepository usersRepository) {
        this.usersRepository = usersRepository;
    }

    @GetMapping("/penyuplai")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPenyuplaiAccounts() {
        List<Map<String, Object>> accounts = usersRepository.findByRole("PENYUPLAI").stream()
                .map(user -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", user.getId());
                    map.put("username", user.getUsername());
                    map.put("namaPenyuplai", user.getPenyuplai() != null ? user.getPenyuplai().getNamaPenyuplai() : null);
                    map.put("penyuplaiId", user.getPenyuplai() != null ? user.getPenyuplai().getId() : null);
                    map.put("createdAt", user.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(accounts));
    }
}
