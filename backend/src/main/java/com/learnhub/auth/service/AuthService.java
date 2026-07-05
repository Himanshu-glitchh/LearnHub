package com.learnhub.auth.service;

import com.learnhub.auth.dto.AuthResponse;
import com.learnhub.auth.dto.LoginRequest;
import com.learnhub.auth.dto.RegisterRequest;
import com.learnhub.auth.entity.User;
import com.learnhub.auth.repository.UserRepository;
import com.learnhub.common.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already registered");
        }

        User.Role role = switch (request.role() == null ? "STUDENT" : request.role().toUpperCase()) {
            case "INSTRUCTOR" -> User.Role.ROLE_INSTRUCTOR;
            case "TUTOR" -> User.Role.ROLE_TUTOR;
            case "ADMIN" -> User.Role.ROLE_ADMIN;
            default -> User.Role.ROLE_STUDENT;
        };

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .roles(Set.of(role))
                .enabled(true) // set false and send email for production
                .emailVerificationToken(UUID.randomUUID().toString())
                .build();

        userRepository.save(user);
        return "Registration successful. Please verify your email.";
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.email());
        User user = userRepository.findByEmail(request.email()).orElseThrow();

        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        Set<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());

        return AuthResponse.of(accessToken, refreshToken, user.getId(),
                user.getFullName(), user.getEmail(), roles);
    }

    public AuthResponse refreshToken(String refreshToken) {
        String email = jwtService.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new BadRequestException("Invalid refresh token");
        }

        User user = userRepository.findByEmail(email).orElseThrow();
        String newAccessToken = jwtService.generateToken(userDetails);

        Set<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());

        return AuthResponse.of(newAccessToken, refreshToken, user.getId(),
                user.getFullName(), user.getEmail(), roles);
    }
}
