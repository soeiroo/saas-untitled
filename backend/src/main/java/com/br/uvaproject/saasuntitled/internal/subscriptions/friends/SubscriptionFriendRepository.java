package com.br.uvaproject.saasuntitled.internal.subscriptions.friends;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionFriendRepository extends JpaRepository<SubscriptionFriend, UUID> {

    Optional<SubscriptionFriend> findBySubscriptionIdAndFriendId(
            UUID subscriptionId,
            UUID friendId);

    List<SubscriptionFriend> findBySubscriptionId(UUID subscriptionId);

    List<SubscriptionFriend> findByFriendId(UUID friendId);
}
