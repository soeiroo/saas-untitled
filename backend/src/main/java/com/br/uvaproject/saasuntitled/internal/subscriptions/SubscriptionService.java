package com.br.uvaproject.saasuntitled.internal.subscriptions;

import com.br.uvaproject.saasuntitled.exceptions.ResourceNotFoundException;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionCreateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionUpdateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.mapper.SubscriptionMapper;
import com.br.uvaproject.saasuntitled.internal.users.User;
import com.br.uvaproject.saasuntitled.internal.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public Subscription create(UUID userId, SubscriptionCreateDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Subscription sub = SubscriptionMapper.fromCreateDTO(dto);
        sub.setUser(user);

        return subscriptionRepository.save(sub);
    }

    public List<Subscription> findByUser(UUID userId) {
        return subscriptionRepository.findByUserId(userId);
    }

    public Subscription update(UUID id, SubscriptionUpdateDTO dto) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
                
        SubscriptionMapper.updateEntityFromDTO(sub, dto);

        return subscriptionRepository.save(sub);
    }

    public void delete(UUID id) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));

        sub.setDeletedAt(LocalDateTime.now());
        subscriptionRepository.deleteById(sub.getId());
    }
}
