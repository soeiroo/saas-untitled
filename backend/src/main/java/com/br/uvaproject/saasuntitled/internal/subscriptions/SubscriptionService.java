package com.br.uvaproject.saasuntitled.internal.subscriptions;

import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionCreateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionUpdateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.mapper.SubscriptionMapper;
import com.br.uvaproject.saasuntitled.internal.users.User;
import com.br.uvaproject.saasuntitled.internal.users.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public Subscription create(UUID userId, SubscriptionCreateDTO dto) {

        if (dto.name() == null || dto.name().isBlank()) {
            throw new IllegalArgumentException("Subscription name must not be empty");
        }

        if (dto.price() == null) {
            throw new IllegalArgumentException("Price must not be null");
        }

        if (dto.renewalDate() == null) {
            throw new IllegalArgumentException("Renewal date must not be null");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Subscription sub = SubscriptionMapper.fromCreateDTO(dto);
        sub.setUser(user);

        return subscriptionRepository.save(sub);
    }

    public List<Subscription> findByUser(UUID userId) {

        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("User not found");
        }

        return subscriptionRepository.findByUserId(userId);
    }

    public Subscription update(UUID id, SubscriptionUpdateDTO dto) {

        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Subscription not found"));

        SubscriptionMapper.updateEntityFromDTO(sub, dto);

        return subscriptionRepository.save(sub);
    }

    public void delete(UUID id) {

        if (!subscriptionRepository.existsById(id)) {
            throw new EntityNotFoundException("Subscription not found");
        }

        subscriptionRepository.deleteById(id);
    }
}
