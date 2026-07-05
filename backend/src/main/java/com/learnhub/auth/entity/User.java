package com.learnhub.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.learnhub.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false, name = "password_hash")
    private String passwordHash;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    private String bio;
    private String avatarUrl;
    private String headline;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = false;

    @JsonIgnore
    private String emailVerificationToken;

    @JsonIgnore
    private String passwordResetToken;

    public enum Role {
        ROLE_STUDENT, ROLE_INSTRUCTOR, ROLE_TUTOR, ROLE_ADMIN
    }
}
