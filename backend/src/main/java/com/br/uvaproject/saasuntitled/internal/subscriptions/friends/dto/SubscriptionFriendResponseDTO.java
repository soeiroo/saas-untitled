package com.br.uvaproject.saasuntitled.internal.subscriptions.friends.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record SubscriptionFriendResponseDTO(
        UUID id,
        String name,
        String email,
        BigDecimal price
) {}
