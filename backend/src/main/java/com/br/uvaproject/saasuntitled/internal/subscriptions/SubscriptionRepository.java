package com.br.uvaproject.saasuntitled.internal.subscriptions;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    List<Subscription> findByUserId(UUID userId);

    @Query("""
                select sf.subscription
                from SubscriptionFriend sf
                where sf.friend.id = :userId
            """)
    List<Subscription> findSubscriptionsWhereUserIsFriend(UUID userId);
}
