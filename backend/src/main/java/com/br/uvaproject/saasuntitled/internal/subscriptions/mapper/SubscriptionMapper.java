package com.br.uvaproject.saasuntitled.internal.subscriptions.mapper;

import com.br.uvaproject.saasuntitled.internal.subscriptions.Subscription;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionCreateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionResponseDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionUpdateDTO;

public class SubscriptionMapper {

    public static SubscriptionResponseDTO toResponse(Subscription sub) {
        return new SubscriptionResponseDTO(
                sub.getId(),
                sub.getUser().getId(),
                sub.getName(),
                sub.getPrice(),
                sub.getRenewalDate(),
                sub.getCategory(),
                sub.getPlan(),
                sub.getCreatedAt(),
                sub.getUpdatedAt()
        );
    }

    public static Subscription fromCreateDTO(SubscriptionCreateDTO dto) {
        return Subscription.builder()
                .name(dto.name())
                .price(dto.price())
                .renewalDate(dto.renewalDate())
                .category(dto.category() != null ? dto.category() : "Outros")
                .plan(dto.plan())
                .createdAt(dto.createdAt())
                .build();
    }
    
    public static void updateEntityFromDTO(Subscription sub, SubscriptionUpdateDTO dto) {
        if (dto.name() != null) sub.setName(dto.name());
        if (dto.price() != null) sub.setPrice(dto.price());
        if (dto.renewalDate() != null) sub.setRenewalDate(dto.renewalDate());
        if (dto.category() != null) sub.setCategory(dto.category());
        if (dto.plan() != null) sub.setPlan(dto.plan());
        if (dto.createdAt() != null) sub.setCreatedAt(dto.createdAt());
    }
}
