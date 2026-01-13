package com.br.uvaproject.saasuntitled.internal.subscriptions;

import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionCreateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionUpdateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.mapper.SubscriptionMapper;
import com.br.uvaproject.saasuntitled.internal.users.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    public Subscription create(User user, SubscriptionCreateDTO dto) {

        if (dto.name() == null || dto.name().isBlank()) {
            throw new IllegalArgumentException("O nome da assinatura não pode estar vazio");
        }

        if (dto.price() == null) {
            throw new IllegalArgumentException("O preço da assinatura é obrigatório");
        }

        if (dto.renewalDate() == null) {
            throw new IllegalArgumentException("A data de renovação é obrigatória");
        }

        Subscription subscription = SubscriptionMapper.fromCreateDTO(dto);
        subscription.setUser(user);

        return subscriptionRepository.save(subscription);
    }

    public List<Subscription> findMine(User user) {
        return subscriptionRepository.findByUserId(user.getId());
    }

    public Subscription update(User user, UUID subscriptionId, SubscriptionUpdateDTO dto) {

        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new EntityNotFoundException("Assinatura não encontrada"));

        if (!subscription.getUser().getId().equals(user.getId())) {
            throw new EntityNotFoundException("Assinatura não encontrada");
        }

        SubscriptionMapper.updateEntityFromDTO(subscription, dto);

        return subscriptionRepository.save(subscription);
    }

    public void delete(User user, UUID subscriptionId) {

        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new EntityNotFoundException("Assinatura não encontrada"));

        if (!subscription.getUser().getId().equals(user.getId())) {
            throw new EntityNotFoundException("Assinatura não encontrada");
        }

        subscriptionRepository.delete(subscription);
    }
}
