package com.tokoagar.inventori.controller;

import com.tokoagar.inventori.dto.ApiResponse;
import com.tokoagar.inventori.dto.LoginRequest;
import com.tokoagar.inventori.dto.LoginResponse;
import com.tokoagar.inventori.dto.RegisterPenyuplaiRequest;
import com.tokoagar.inventori.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login berhasil", response));
    }

    @PostMapping("/register-penyuplai")
    public ResponseEntity<?> registerPenyuplai(@Valid @RequestBody RegisterPenyuplaiRequest request) {
        try {
            authService.registerPenyuplai(request);
            return ResponseEntity.ok(ApiResponse.success("Akun penyuplai berhasil dibuat", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
