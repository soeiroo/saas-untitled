package com.br.uvaproject.saasuntitled.internal.subscriptions.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SubscriptionUpdateDTO(
        String name,
        BigDecimal price,
        LocalDate renewalDate,
        String category
) {}
