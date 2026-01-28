package com.br.uvaproject.saasuntitled.internal.subscriptions.friends;

import com.br.uvaproject.saasuntitled.internal.friends.UserFriend;
import com.br.uvaproject.saasuntitled.internal.friends.UserFriendRepository;
import com.br.uvaproject.saasuntitled.internal.subscriptions.Subscription;
import com.br.uvaproject.saasuntitled.internal.subscriptions.SubscriptionRepository;
import com.br.uvaproject.saasuntitled.internal.users.User;
import com.br.uvaproject.saasuntitled.internal.users.dto.UserSearchResponseDTO;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SubscriptionFriendServiceTest {

    private SubscriptionRepository subscriptionRepository;
    private SubscriptionFriendRepository subscriptionFriendRepository;
    private UserFriendRepository userFriendRepository;

    private SubscriptionFriendService service;

    private User owner;
    private User friend;
    private Subscription subscription;

    @BeforeEach
    void setUp() {
        subscriptionRepository = mock(SubscriptionRepository.class);
        subscriptionFriendRepository = mock(SubscriptionFriendRepository.class);
        userFriendRepository = mock(UserFriendRepository.class);

        service = new SubscriptionFriendService(
                subscriptionRepository,
                subscriptionFriendRepository,
                userFriendRepository
        );

        owner = new User();
        owner.setId(UUID.randomUUID());
        owner.setName("Jonas");

        friend = new User();
        friend.setId(UUID.randomUUID());
        friend.setName("Maria");

        subscription = new Subscription();
        subscription.setId(UUID.randomUUID());
        subscription.setUser(owner);
    }

    @Test
    void addFriendToSubscription_Success() {
        when(subscriptionRepository.findById(subscription.getId()))
                .thenReturn(Optional.of(subscription));

        when(userFriendRepository.findByUserIdAndFriendId(owner.getId(), friend.getId()))
                .thenReturn(Optional.of(new UserFriend()));

        when(subscriptionFriendRepository
                .findBySubscriptionIdAndFriendId(subscription.getId(), friend.getId()))
                .thenReturn(Optional.empty());

        assertDoesNotThrow(() ->
                service.addFriendToSubscription(owner, subscription.getId(), friend.getId())
        );

        verify(subscriptionFriendRepository).save(any(SubscriptionFriend.class));
    }

    @Test
    void addFriendToSubscription_SubscriptionNotFound() {
        when(subscriptionRepository.findById(subscription.getId()))
                .thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> service.addFriendToSubscription(owner, subscription.getId(), friend.getId())
        );

        assertEquals("Assinatura não encontrada", ex.getMessage());
    }

    @Test
    void addFriendToSubscription_NotOwner() {
        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());

        subscription.setUser(otherUser);

        when(subscriptionRepository.findById(subscription.getId()))
                .thenReturn(Optional.of(subscription));

        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> service.addFriendToSubscription(owner, subscription.getId(), friend.getId())
        );

        assertEquals("Assinatura não encontrada", ex.getMessage());
    }

    @Test
    void addFriendToSubscription_NotFriends() {
        when(subscriptionRepository.findById(subscription.getId()))
                .thenReturn(Optional.of(subscription));

        when(userFriendRepository.findByUserIdAndFriendId(owner.getId(), friend.getId()))
                .thenReturn(Optional.empty());

        when(userFriendRepository.findByUserIdAndFriendId(friend.getId(), owner.getId()))
                .thenReturn(Optional.empty());

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> service.addFriendToSubscription(owner, subscription.getId(), friend.getId())
        );

        assertEquals("Usuário não é seu amigo", ex.getMessage());
    }

    @Test
    void addFriendToSubscription_AlreadyAdded() {
        when(subscriptionRepository.findById(subscription.getId()))
                .thenReturn(Optional.of(subscription));

        when(userFriendRepository.findByUserIdAndFriendId(owner.getId(), friend.getId()))
                .thenReturn(Optional.of(new UserFriend()));

        when(subscriptionFriendRepository
                .findBySubscriptionIdAndFriendId(subscription.getId(), friend.getId()))
                .thenReturn(Optional.of(new SubscriptionFriend()));

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> service.addFriendToSubscription(owner, subscription.getId(), friend.getId())
        );

        assertEquals("Amigo já está na assinatura", ex.getMessage());
    }

    @Test
    void listFriends_Success() {
        SubscriptionFriend sf = new SubscriptionFriend();
        sf.setSubscription(subscription);
        sf.setFriend(friend);

        when(subscriptionRepository.findById(subscription.getId()))
                .thenReturn(Optional.of(subscription));

        when(subscriptionFriendRepository.findBySubscriptionId(subscription.getId()))
                .thenReturn(List.of(sf));

        List<UserSearchResponseDTO> result =
                service.listFriends(subscription.getId(), owner);

        assertEquals(1, result.size());
        assertEquals(friend.getId(), result.get(0).id());
    }

    @Test
    void listFriends_SubscriptionNotFound() {
        when(subscriptionRepository.findById(subscription.getId()))
                .thenReturn(Optional.empty());

        assertThrows(
                EntityNotFoundException.class,
                () -> service.listFriends(subscription.getId(), owner)
        );
    }

    @Test
    void listFriends_NotOwner() {
        User other = new User();
        other.setId(UUID.randomUUID());
        subscription.setUser(other);

        when(subscriptionRepository.findById(subscription.getId()))
                .thenReturn(Optional.of(subscription));

        assertThrows(
                EntityNotFoundException.class,
                () -> service.listFriends(subscription.getId(), owner)
        );
    }

    @Test
    void removeFriendFromSubscription_Success() {
        SubscriptionFriend sf = new SubscriptionFriend();
        sf.setSubscription(subscription);
        sf.setFriend(friend);

        when(subscriptionFriendRepository
                .findBySubscriptionIdAndFriendId(subscription.getId(), friend.getId()))
                .thenReturn(Optional.of(sf));

        assertDoesNotThrow(() ->
                service.removeFriendFromSubscription(owner, subscription.getId(), friend.getId())
        );

        verify(subscriptionFriendRepository).delete(sf);
    }

    @Test
    void removeFriendFromSubscription_NotFound() {
        when(subscriptionFriendRepository
                .findBySubscriptionIdAndFriendId(subscription.getId(), friend.getId()))
                .thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> service.removeFriendFromSubscription(owner, subscription.getId(), friend.getId())
        );

        assertEquals("Amigo não está na assinatura", ex.getMessage());
    }

    @Test
    void removeFriendFromSubscription_NotOwner() {
        User other = new User();
        other.setId(UUID.randomUUID());
        subscription.setUser(other);

        SubscriptionFriend sf = new SubscriptionFriend();
        sf.setSubscription(subscription);
        sf.setFriend(friend);

        when(subscriptionFriendRepository
                .findBySubscriptionIdAndFriendId(subscription.getId(), friend.getId()))
                .thenReturn(Optional.of(sf));

        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> service.removeFriendFromSubscription(owner, subscription.getId(), friend.getId())
        );

        assertEquals("Assinatura não encontrada", ex.getMessage());
    }
}
