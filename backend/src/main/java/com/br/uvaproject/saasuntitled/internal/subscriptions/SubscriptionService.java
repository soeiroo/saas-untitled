package com.br.uvaproject.saasuntitled.internal.subscriptions;

import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionCreateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionUpdateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.mapper.SubscriptionMapper;
import com.br.uvaproject.saasuntitled.internal.users.User;
import com.br.uvaproject.saasuntitled.internal.users.UserRepository;
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
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Subscription sub = SubscriptionMapper.fromCreateDTO(dto);
        sub.setUser(user);

        return subscriptionRepository.save(sub);
    }

    public List<Subscription> findByUser(UUID userId) {
        return subscriptionRepository.findByUserId(userId);
    }

    public Subscription update(UUID id, SubscriptionUpdateDTO dto) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        if (dto.name() != null) sub.setName(dto.name());
        if (dto.price() != null) sub.setPrice(dto.price());
        if (dto.renewalDate() != null) sub.setRenewalDate(dto.renewalDate());
        if (dto.category() != null) sub.setCategory(dto.category());

        return subscriptionRepository.save(sub);
    }

    public void delete(UUID id) {
        subscriptionRepository.deleteById(id);
    }
}
