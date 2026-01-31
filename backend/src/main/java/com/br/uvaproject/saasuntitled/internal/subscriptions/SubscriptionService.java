package com.br.uvaproject.saasuntitled.internal.subscriptions;

import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionCreateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionResponseDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionUpdateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.mapper.SubscriptionMapper;
import com.br.uvaproject.saasuntitled.internal.subscriptions.friends.SubscriptionFriendRepository;
import com.br.uvaproject.saasuntitled.internal.users.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionFriendRepository subscriptionFriendRepository;

    public SubscriptionResponseDTO create(User user, SubscriptionCreateDTO dto) {

        validateCreate(dto);

        Subscription subscription = SubscriptionMapper.fromCreateDTO(dto);
        subscription.setUser(user);

        subscriptionRepository.save(subscription);

        return SubscriptionMapper.toResponse(subscription);
    }

    @Transactional(readOnly = true)
    public List<SubscriptionResponseDTO> findMine(User user) {
        return subscriptionRepository.findByUserId(user.getId())
                .stream()
                .map(SubscriptionMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SubscriptionResponseDTO> findSharedWithMe(User user) {
        return subscriptionFriendRepository
                .findByFriendId(user.getId())
                .stream()
                .map(sf -> SubscriptionMapper.toResponse(sf.getSubscription(), sf.getPrice()))
                .toList();
    }

    public SubscriptionResponseDTO update(
            User user,
            UUID subscriptionId,
            SubscriptionUpdateDTO dto) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new EntityNotFoundException("Assinatura não encontrada"));

        if (!subscription.getUser().getId().equals(user.getId())) {
            throw new EntityNotFoundException("Assinatura não encontrada");
        }

        validateUpdate(dto);

        SubscriptionMapper.updateEntityFromDTO(subscription, dto);

        Subscription updated = subscriptionRepository.save(subscription);

        return SubscriptionMapper.toResponse(updated);
    }

    public void delete(User user, UUID subscriptionId) {

        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new EntityNotFoundException("Assinatura não encontrada"));

        if (!subscription.getUser().getId().equals(user.getId())) {
            throw new EntityNotFoundException("Assinatura não encontrada");
        }

        subscriptionRepository.delete(subscription);
    }

    private void validateCreate(SubscriptionCreateDTO dto) {

        if (dto.name() == null || dto.name().isBlank()) {
            throw new IllegalArgumentException("O nome da assinatura não pode estar vazio");
        }

        if (dto.price() == null) {
            throw new IllegalArgumentException("O preço da assinatura é obrigatório");
        }

        if (dto.renewalDate() == null) {
            throw new IllegalArgumentException("A data de renovação é obrigatória");
        }

        if (dto.category() == null || dto.category().isBlank()) {
            throw new IllegalArgumentException("A categoria da assinatura é obrigatória");
        }
    }

    private void validateUpdate(SubscriptionUpdateDTO dto) {

        if (dto.name() != null && dto.name().isBlank()) {
            throw new IllegalArgumentException("O nome da assinatura não pode estar vazio");
        }

        if (dto.category() != null && dto.category().isBlank()) {
            throw new IllegalArgumentException("A categoria da assinatura é obrigatória");
        }
    }
}
