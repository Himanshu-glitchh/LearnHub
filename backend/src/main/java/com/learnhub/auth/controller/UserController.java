package com.learnhub.auth.controller;

import com.learnhub.auth.entity.User;
import com.learnhub.auth.repository.UserRepository;
import com.learnhub.common.exception.BadRequestException;
import com.learnhub.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    private Long userId(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow().getId();
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMe(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(userRepo.findByEmail(ud.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found")));
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateMe(@AuthenticationPrincipal UserDetails ud,
                                          @RequestBody Map<String, String> body) {
        User user = userRepo.findByEmail(ud.getUsername()).orElseThrow();
        if (body.containsKey("fullName") && !body.get("fullName").isBlank())
            user.setFullName(body.get("fullName"));
        if (body.containsKey("bio")) user.setBio(body.get("bio"));
        if (body.containsKey("headline")) user.setHeadline(body.get("headline"));
        if (body.containsKey("avatarUrl")) user.setAvatarUrl(body.get("avatarUrl"));
        return ResponseEntity.ok(userRepo.save(user));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(@AuthenticationPrincipal UserDetails ud,
                                                               @RequestBody Map<String, String> body) {
        User user = userRepo.findByEmail(ud.getUsername()).orElseThrow();
        String current = body.get("currentPassword");
        String newPw = body.get("newPassword");
        if (!passwordEncoder.matches(current, user.getPasswordHash()))
            throw new BadRequestException("Current password is incorrect");
        if (newPw == null || newPw.length() < 8)
            throw new BadRequestException("New password must be at least 8 characters");
        user.setPasswordHash(passwordEncoder.encode(newPw));
        userRepo.save(user);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    // List users (for instructor to search/add students to batches)
    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required = false) String role,
                                   @RequestParam(required = false) String email,
                                   @RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "50") int size) {
        if (email != null && !email.isBlank()) {
            return ResponseEntity.ok(userRepo.findByEmail(email)
                    .map(List::of).orElse(List.of()));
        }
        Page<User> users = userRepo.findAll(PageRequest.of(page, size));
        if (role != null) {
            List<User> filtered = users.stream()
                    .filter(u -> u.getRoles().stream().anyMatch(r -> r.name().equals(role)))
                    .toList();
            return ResponseEntity.ok(filtered);
        }
        return ResponseEntity.ok(users.getContent());
    }

    // Search by email (for batch management)
    @GetMapping("/search")
    public ResponseEntity<User> searchByEmail(@RequestParam String email) {
        return ResponseEntity.ok(userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email)));
    }
}
