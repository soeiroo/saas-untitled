package com.br.uvaproject.saasuntitled.internal.subscriptions;

import com.br.uvaproject.saasuntitled.internal.subscriptions.Subscription;
import com.br.uvaproject.saasuntitled.internal.subscriptions.SubscriptionRepository;
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

    public Subscription createSubscription(UUID userId, Subscription subscription) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        subscription.setUser(user);
        return subscriptionRepository.save(subscription);
    }

    public List<Subscription> getSubscriptionsByUser(UUID userId) {
        return subscriptionRepository.findByUserId(userId);
    }

    public Subscription updateSubscription(UUID id, Subscription updated) {
        return subscriptionRepository.findById(id).map(sub -> {
            sub.setName(updated.getName());
            sub.setPrice(updated.getPrice());
            sub.setRenewalDate(updated.getRenewalDate());
            sub.setCategory(updated.getCategory());
            return subscriptionRepository.save(sub);
        }).orElseThrow(() -> new RuntimeException("Subscription not found"));
    }

    public void deleteSubscription(UUID id) {
        subscriptionRepository.deleteById(id);
    }
}
