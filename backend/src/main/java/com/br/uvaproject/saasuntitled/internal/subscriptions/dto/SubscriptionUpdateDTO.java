package com.br.uvaproject.saasuntitled.internal.subscriptions.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record SubscriptionUpdateDTO(
        String name,
        BigDecimal price,
        LocalDate renewalDate,
        String category,
        String plan,
        String period,
        String icon,
        LocalDate createdAt
) {}
