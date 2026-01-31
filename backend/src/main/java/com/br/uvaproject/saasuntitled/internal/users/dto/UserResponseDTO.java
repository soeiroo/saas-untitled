package com.br.uvaproject.saasuntitled.internal.users.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponseDTO(
        UUID id,
        String email,
        String name,
        String profilePicture,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
