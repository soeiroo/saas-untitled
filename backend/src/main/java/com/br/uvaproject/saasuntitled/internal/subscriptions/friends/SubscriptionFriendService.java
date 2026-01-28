package com.br.uvaproject.saasuntitled.internal.subscriptions.friends;

import com.br.uvaproject.saasuntitled.internal.friends.UserFriendRepository;
import com.br.uvaproject.saasuntitled.internal.subscriptions.Subscription;
import com.br.uvaproject.saasuntitled.internal.subscriptions.SubscriptionRepository;
import com.br.uvaproject.saasuntitled.internal.users.User;
import com.br.uvaproject.saasuntitled.internal.users.dto.UserSearchResponseDTO;
import com.br.uvaproject.saasuntitled.internal.users.mapper.UserMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional
public class SubscriptionFriendService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionFriendRepository subscriptionFriendRepository;
    private final UserFriendRepository userFriendRepository;

    public void addFriendToSubscription(
        User user,
        UUID subscriptionId,
        UUID friendId,
        BigDecimal price
    ) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new EntityNotFoundException("Assinatura não encontrada"));

        if (!subscription.getUser().getId().equals(user.getId())) {
            throw new EntityNotFoundException("Assinatura não encontrada");
        }

        boolean areFriends =
                userFriendRepository.findByUserIdAndFriendId(user.getId(), friendId).isPresent()
             || userFriendRepository.findByUserIdAndFriendId(friendId, user.getId()).isPresent();

        if (!areFriends) {
            throw new IllegalStateException("Usuário não é seu amigo");
        }

        subscriptionFriendRepository
                .findBySubscriptionIdAndFriendId(subscriptionId, friendId)
                .ifPresent(f -> {
                    throw new IllegalStateException("Amigo já está na assinatura");
                });

        SubscriptionFriend sf = new SubscriptionFriend();
        sf.setSubscription(subscription);

        User friend = new User();
        friend.setId(friendId);
        sf.setFriend(friend);
        sf.setPrice(price);

        subscriptionFriendRepository.save(sf);
    }

    @Transactional(readOnly = true)
    public List<UserSearchResponseDTO> listFriends(
            UUID subscriptionId,
            User user
    ) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new EntityNotFoundException("Assinatura não encontrada"));

        if (!subscription.getUser().getId().equals(user.getId())) {
            throw new EntityNotFoundException("Assinatura não encontrada");
        }

        return subscriptionFriendRepository.findBySubscriptionId(subscriptionId)
                .stream()
                .map(sf -> UserMapper.toSearchResponse(sf.getFriend()))
                .toList();
    }

    @Transactional
    public void updateFriendPrice(
            User user,
            UUID subscriptionId,
            UUID friendId,
            BigDecimal price
    ) {
        SubscriptionFriend sf = subscriptionFriendRepository
                .findBySubscriptionIdAndFriendId(subscriptionId, friendId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Amigo não está na assinatura")
                );

        if (!sf.getSubscription().getUser().getId().equals(user.getId())) {
            throw new EntityNotFoundException("Assinatura não encontrada");
        }

        sf.setPrice(price);
    }

    public void removeFriendFromSubscription(
            User user,
            UUID subscriptionId,
            UUID friendId
    ) {
        SubscriptionFriend sf = subscriptionFriendRepository
                .findBySubscriptionIdAndFriendId(subscriptionId, friendId)
                .orElseThrow(() -> new EntityNotFoundException("Amigo não está na assinatura"));

        if (!sf.getSubscription().getUser().getId().equals(user.getId())) {
            throw new EntityNotFoundException("Assinatura não encontrada");
        }

        subscriptionFriendRepository.delete(sf);
    }
}
