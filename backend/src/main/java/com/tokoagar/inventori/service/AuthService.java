package com.tokoagar.inventori.service;

import com.tokoagar.inventori.dto.LoginRequest;
import com.tokoagar.inventori.dto.LoginResponse;
import com.tokoagar.inventori.dto.RegisterPenyuplaiRequest;
import com.tokoagar.inventori.entity.Penyuplai;
import com.tokoagar.inventori.entity.Users;
import com.tokoagar.inventori.repository.PenyuplaiRepository;
import com.tokoagar.inventori.repository.UsersRepository;
import com.tokoagar.inventori.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UsersRepository usersRepository;
    private final PenyuplaiRepository penyuplaiRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil,
                       UsersRepository usersRepository,
                       PenyuplaiRepository penyuplaiRepository,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.usersRepository = usersRepository;
        this.penyuplaiRepository = penyuplaiRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Users user = usersRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());

        LoginResponse.LoginResponseBuilder builder = LoginResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole());

        if (user.getPenyuplai() != null) {
            builder.penyuplaiId(user.getPenyuplai().getId());
            builder.namaPenyuplai(user.getPenyuplai().getNamaPenyuplai());
        }

        return builder.build();
    }

    public void registerPenyuplai(RegisterPenyuplaiRequest request) {
        if (usersRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username sudah digunakan");
        }

        if (usersRepository.existsByPenyuplaiId(request.getPenyuplaiId())) {
            throw new RuntimeException("Penyuplai ini sudah memiliki akun");
        }

        Penyuplai penyuplai = penyuplaiRepository.findById(request.getPenyuplaiId())
                .orElseThrow(() -> new RuntimeException("Penyuplai tidak ditemukan"));

        Users user = Users.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("PENYUPLAI")
                .penyuplai(penyuplai)
                .build();

        usersRepository.save(user);
    }
}
