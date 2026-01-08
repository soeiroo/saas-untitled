package com.br.uvaproject.saasuntitled.internal.subscriptions.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record SubscriptionResponseDTO(
        UUID id,
        UUID userId,
        String name,
        BigDecimal price,
        LocalDate renewalDate,
        String category,
        String plan,
        LocalDate createdAt,
        LocalDateTime updatedAt
) {}
