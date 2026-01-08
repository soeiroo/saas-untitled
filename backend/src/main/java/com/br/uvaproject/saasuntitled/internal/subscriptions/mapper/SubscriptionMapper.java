package com.br.uvaproject.saasuntitled.internal.subscriptions.mapper;

import com.br.uvaproject.saasuntitled.internal.subscriptions.Subscription;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionCreateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionResponseDTO;

public class SubscriptionMapper {

    public static SubscriptionResponseDTO toResponse(Subscription sub) {
        return new SubscriptionResponseDTO(
                sub.getId(),
                sub.getUser().getId(),
                sub.getName(),
                sub.getPrice(),
                sub.getRenewalDate(),
                sub.getCategory(),
                sub.getCreatedAt(),
                sub.getUpdatedAt()
        );
    }

    public static Subscription fromCreateDTO(
            SubscriptionCreateDTO dto
    ) {
        return Subscription.builder()
                .name(dto.name())
                .price(dto.price())
                .renewalDate(dto.renewalDate())
                .category(dto.category() != null ? dto.category() : "Outros")
                .build();
    }
}
