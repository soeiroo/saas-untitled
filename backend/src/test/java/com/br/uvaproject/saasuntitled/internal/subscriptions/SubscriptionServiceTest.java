package com.br.uvaproject.saasuntitled.internal.subscriptions;

import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionCreateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionUpdateDTO;
import com.br.uvaproject.saasuntitled.internal.users.User;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SubscriptionServiceTest {

    private SubscriptionRepository subscriptionRepository;
    private SubscriptionService subscriptionService;

    private User user;

    @BeforeEach
    void setUp() {
        subscriptionRepository = mock(SubscriptionRepository.class);
        subscriptionService = new SubscriptionService(subscriptionRepository);

        user = new User();
        user.setId(UUID.randomUUID());
    }

    @Test
    void createSubscription_Success() {
        SubscriptionCreateDTO dto = new SubscriptionCreateDTO(
                "Netflix",
                new BigDecimal("29.90"),
                LocalDate.of(2026, 1, 1),
                "Streaming",
                null,
                "Premium"
        );

        when(subscriptionRepository.save(any(Subscription.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        Subscription result = subscriptionService.create(user, dto);

        assertNotNull(result);
        assertEquals("Netflix", result.getName());
        assertEquals(new BigDecimal("29.90"), result.getPrice());
        assertEquals("Streaming", result.getCategory());
        assertEquals(user, result.getUser());

        verify(subscriptionRepository).save(any(Subscription.class));
    }

    @Test
    void createSubscription_EmptyName_Throws() {
        SubscriptionCreateDTO dto = new SubscriptionCreateDTO(
                "",
                new BigDecimal("10.00"),
                LocalDate.now(),
                "Streaming",
                null,
                null
        );

        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class,
                        () -> subscriptionService.create(user, dto));

        assertEquals("O nome da assinatura não pode estar vazio", ex.getMessage());
    }

    @Test
    void createSubscription_NullPrice_Throws() {
        SubscriptionCreateDTO dto = new SubscriptionCreateDTO(
                "Spotify",
                null,
                LocalDate.now(),
                "Streaming",
                null,
                null
        );

        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class,
                        () -> subscriptionService.create(user, dto));

        assertEquals("O preço da assinatura é obrigatório", ex.getMessage());
    }

    @Test
    void createSubscription_NullRenewalDate_Throws() {
        SubscriptionCreateDTO dto = new SubscriptionCreateDTO(
                "Spotify",
                new BigDecimal("19.90"),
                null,
                "Streaming",
                null,
                null
        );

        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class,
                        () -> subscriptionService.create(user, dto));

        assertEquals("A data de renovação é obrigatória", ex.getMessage());
    }

    @Test
    void createSubscription_EmptyCategory_Throws() {
        SubscriptionCreateDTO dto = new SubscriptionCreateDTO(
                "Spotify",
                new BigDecimal("19.90"),
                LocalDate.now(),
                "",
                null,
                null
        );

        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class,
                        () -> subscriptionService.create(user, dto));

        assertEquals("A categoria da assinatura é obrigatória", ex.getMessage());
    }

    @Test
    void findMine_ReturnsSubscriptions() {
        Subscription s1 = new Subscription();
        s1.setUser(user);

        Subscription s2 = new Subscription();
        s2.setUser(user);

        when(subscriptionRepository.findByUserId(user.getId()))
                .thenReturn(List.of(s1, s2));

        List<Subscription> result = subscriptionService.findMine(user);

        assertEquals(2, result.size());
        verify(subscriptionRepository).findByUserId(user.getId());
    }

    @Test
    void updateSubscription_Success() {
        UUID subscriptionId = UUID.randomUUID();

        Subscription subscription = new Subscription();
        subscription.setId(subscriptionId);
        subscription.setUser(user);
        subscription.setName("Netflix");
        subscription.setCategory("Streaming");

        when(subscriptionRepository.findById(subscriptionId))
                .thenReturn(Optional.of(subscription));
        when(subscriptionRepository.save(any(Subscription.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        SubscriptionUpdateDTO dto = new SubscriptionUpdateDTO(
                "Netflix Atualizado",
                new BigDecimal("39.90"),
                LocalDate.of(2026, 2, 1),
                "Streaming Premium",
                "Gold",
                null
        );

        Subscription updated =
                subscriptionService.update(user, subscriptionId, dto);

        assertEquals("Netflix Atualizado", updated.getName());
        assertEquals(new BigDecimal("39.90"), updated.getPrice());
        assertEquals("Streaming Premium", updated.getCategory());

        verify(subscriptionRepository).save(subscription);
    }

    @Test
    void updateSubscription_EmptyName_Throws() {
        UUID subscriptionId = UUID.randomUUID();
        Subscription subscription = new Subscription();
        subscription.setId(subscriptionId);
        subscription.setUser(user);

        when(subscriptionRepository.findById(subscriptionId))
                .thenReturn(Optional.of(subscription));

        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class,
                        () -> subscriptionService.update(user, subscriptionId,
                                new SubscriptionUpdateDTO("", null, null, null, null, null)));

        assertEquals("O nome da assinatura não pode estar vazio", ex.getMessage());
    }

    @Test
    void updateSubscription_EmptyCategory_Throws() {
        UUID subscriptionId = UUID.randomUUID();
        Subscription subscription = new Subscription();
        subscription.setId(subscriptionId);
        subscription.setUser(user);

        when(subscriptionRepository.findById(subscriptionId))
                .thenReturn(Optional.of(subscription));

        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class,
                        () -> subscriptionService.update(user, subscriptionId,
                                new SubscriptionUpdateDTO(null, null, null, "", null, null)));

        assertEquals("A categoria da assinatura é obrigatória", ex.getMessage());
    }

    @Test
    void updateSubscription_NotOwner_Throws() {
        UUID subscriptionId = UUID.randomUUID();
        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());

        Subscription subscription = new Subscription();
        subscription.setId(subscriptionId);
        subscription.setUser(otherUser);

        when(subscriptionRepository.findById(subscriptionId))
                .thenReturn(Optional.of(subscription));

        EntityNotFoundException ex =
                assertThrows(EntityNotFoundException.class,
                        () -> subscriptionService.update(user, subscriptionId,
                                new SubscriptionUpdateDTO(null, null, null, null, null, null)));

        assertEquals("Assinatura não encontrada", ex.getMessage());
    }

    @Test
    void updateSubscription_NotFound_Throws() {
        UUID subscriptionId = UUID.randomUUID();
        when(subscriptionRepository.findById(subscriptionId)).thenReturn(Optional.empty());

        EntityNotFoundException ex =
                assertThrows(EntityNotFoundException.class,
                        () -> subscriptionService.update(user, subscriptionId,
                                new SubscriptionUpdateDTO(null, null, null, null, null, null)));

        assertEquals("Assinatura não encontrada", ex.getMessage());
    }

    @Test
    void deleteSubscription_Success() {
        UUID subscriptionId = UUID.randomUUID();

        Subscription subscription = new Subscription();
        subscription.setId(subscriptionId);
        subscription.setUser(user);

        when(subscriptionRepository.findById(subscriptionId))
                .thenReturn(Optional.of(subscription));

        assertDoesNotThrow(() ->
                subscriptionService.delete(user, subscriptionId));

        verify(subscriptionRepository).delete(subscription);
    }

    @Test
    void deleteSubscription_NotOwner_Throws() {
        UUID subscriptionId = UUID.randomUUID();
        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());

        Subscription subscription = new Subscription();
        subscription.setId(subscriptionId);
        subscription.setUser(otherUser);

        when(subscriptionRepository.findById(subscriptionId))
                .thenReturn(Optional.of(subscription));

        EntityNotFoundException ex =
                assertThrows(EntityNotFoundException.class,
                        () -> subscriptionService.delete(user, subscriptionId));

        assertEquals("Assinatura não encontrada", ex.getMessage());
    }

    @Test
    void deleteSubscription_NotFound_Throws() {
        UUID subscriptionId = UUID.randomUUID();
        when(subscriptionRepository.findById(subscriptionId))
                .thenReturn(Optional.empty());

        EntityNotFoundException ex =
                assertThrows(EntityNotFoundException.class,
                        () -> subscriptionService.delete(user, subscriptionId));

        assertEquals("Assinatura não encontrada", ex.getMessage());
    }
}
