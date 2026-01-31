package com.br.uvaproject.saasuntitled.internal.friends.dto;

import java.util.UUID;

public record FriendRequestDTO(
        UUID requestId,
        UUID userId,
        String name,
        String email,
        String profilePicture
) {}
