package com.tokoagar.inventori.config;

import com.tokoagar.inventori.entity.Users;
import com.tokoagar.inventori.repository.UsersRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsersRepository usersRepository, PasswordEncoder passwordEncoder) {
        this.usersRepository = usersRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!usersRepository.existsByUsername("admin")) {
            Users admin = Users.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .role("ADMIN")
                    .build();
            usersRepository.save(admin);
            System.out.println(">>> Default admin user created (admin / admin123)");
        } else {
            System.out.println(">>> Admin user already exists, skipping initialization.");
        }
    }
}
