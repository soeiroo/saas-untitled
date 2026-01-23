package com.br.uvaproject.saasuntitled.internal.subscriptions.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record SubscriptionCreateDTO(
    String name,
    BigDecimal price,
    LocalDate renewalDate,
    String category,
    LocalDate createdAt,
    String plan,
    String period,
    String icon
) {}
