package com.br.uvaproject.saasuntitled.internal.users.repository;

import com.br.uvaproject.saasuntitled.internal.users.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
}
