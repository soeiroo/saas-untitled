package com.br.uvaproject.saasuntitled.internal.users.dto;

import java.util.UUID;

public record UserSearchResponseDTO(
        UUID id,
        String name,
        String email
) {}
