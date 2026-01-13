package com.br.uvaproject.saasuntitled.internal.subscriptions;

import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionCreateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionUpdateDTO;
import com.br.uvaproject.saasuntitled.internal.users.User;
import com.br.uvaproject.saasuntitled.internal.users.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SubscriptionServiceTest {

    private SubscriptionRepository subscriptionRepository;
    private UserRepository userRepository;
    private SubscriptionService subscriptionService;

    @BeforeEach
    void setUp() {
        subscriptionRepository = mock(SubscriptionRepository.class);
        userRepository = mock(UserRepository.class);
        subscriptionService = new SubscriptionService(subscriptionRepository, userRepository);
    }

    @Test
    void createSubscription_Success() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);

        SubscriptionCreateDTO dto = new SubscriptionCreateDTO(
                "Netflix", new BigDecimal("29.90"), LocalDate.of(2026, 1, 1),
                "Streaming", null, "Premium"
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        Subscription savedSub = new Subscription();
        savedSub.setId(UUID.randomUUID());
        savedSub.setUser(user);
        savedSub.setName(dto.name());
        savedSub.setPrice(dto.price());
        savedSub.setRenewalDate(dto.renewalDate());
        savedSub.setCategory(dto.category());
        savedSub.setPlan(dto.plan());

        when(subscriptionRepository.save(any(Subscription.class))).thenReturn(savedSub);

        Subscription result = subscriptionService.create(userId, dto);

        assertNotNull(result.getId());
        assertEquals("Netflix", result.getName());
        assertEquals(new BigDecimal("29.90"), result.getPrice());
        assertEquals(userId, result.getUser().getId());
        verify(subscriptionRepository).save(any(Subscription.class));
    }

    @Test
    void createSubscription_EmptyName_Throws() {
        UUID userId = UUID.randomUUID();
        SubscriptionCreateDTO dto = new SubscriptionCreateDTO(
                "", new BigDecimal("29.90"), LocalDate.now(),
                "Streaming", null, "Premium"
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            subscriptionService.create(userId, dto);
        });

        assertEquals("O nome da assinatura não pode estar vazio", ex.getMessage());
    }

    @Test
    void createSubscription_NullPrice_Throws() {
        UUID userId = UUID.randomUUID();
        SubscriptionCreateDTO dto = new SubscriptionCreateDTO(
                "Spotify", null, LocalDate.now(),
                "Streaming", null, null
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            subscriptionService.create(userId, dto);
        });

        assertEquals("O preço da assinatura é obrigatório", ex.getMessage());
    }

    @Test
    void createSubscription_NullRenewalDate_Throws() {
        UUID userId = UUID.randomUUID();
        SubscriptionCreateDTO dto = new SubscriptionCreateDTO(
                "Spotify", new BigDecimal("29.90"), null,
                "Streaming", null, null
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            subscriptionService.create(userId, dto);
        });

        assertEquals("A data de renovação é obrigatória", ex.getMessage());
    }

    @Test
    void createSubscription_UserNotFound_Throws() {
        UUID userId = UUID.randomUUID();
        SubscriptionCreateDTO dto = new SubscriptionCreateDTO(
                "Spotify", new BigDecimal("29.90"), LocalDate.now(),
                "Streaming", null, null
        );

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () -> {
            subscriptionService.create(userId, dto);
        });

        assertEquals("Usuário não encontrado", ex.getMessage());
    }

    @Test
    void findByUser_Success() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);

        Subscription sub1 = new Subscription();
        sub1.setId(UUID.randomUUID());
        sub1.setUser(user);

        Subscription sub2 = new Subscription();
        sub2.setId(UUID.randomUUID());
        sub2.setUser(user);

        when(userRepository.existsById(userId)).thenReturn(true);
        when(subscriptionRepository.findByUserId(userId)).thenReturn(List.of(sub1, sub2));

        List<Subscription> results = subscriptionService.findByUser(userId);

        assertEquals(2, results.size());
    }

    @Test
    void findByUser_UserNotFound_Throws() {
        UUID userId = UUID.randomUUID();
        when(userRepository.existsById(userId)).thenReturn(false);

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () -> {
            subscriptionService.findByUser(userId);
        });

        assertEquals("Usuário não encontrado", ex.getMessage());
    }

    @Test
    void updateSubscription_Success() {
        UUID subId = UUID.randomUUID();
        Subscription sub = new Subscription();
        sub.setId(subId);
        sub.setName("Netflix");
        sub.setPrice(new BigDecimal("29.90"));
        sub.setRenewalDate(LocalDate.of(2026, 1, 1));
        sub.setCategory("Streaming");
        sub.setPlan("Premium");

        when(subscriptionRepository.findById(subId)).thenReturn(Optional.of(sub));
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SubscriptionUpdateDTO dto = new SubscriptionUpdateDTO(
                "Netflix Atualizado",
                new BigDecimal("35.00"),
                LocalDate.of(2026, 2, 1),
                "Streaming Atualizado",
                "Gold",
                LocalDate.of(2025,1,1)
        );

        Subscription result = subscriptionService.update(subId, dto);

        assertNotNull(result);
        assertEquals("Netflix Atualizado", result.getName());
        assertEquals(new BigDecimal("35.00"), result.getPrice());
        assertEquals("Streaming Atualizado", result.getCategory());
        assertEquals("Gold", result.getPlan());
        assertEquals(LocalDate.of(2025,1,1), result.getCreatedAt());
    }


    @Test
    void updateSubscription_NotFound_Throws() {
        UUID subId = UUID.randomUUID();
        when(subscriptionRepository.findById(subId)).thenReturn(Optional.empty());

        SubscriptionUpdateDTO dto = new SubscriptionUpdateDTO(
                "Netflix Atualizado",
                new BigDecimal("35.00"),
                LocalDate.of(2026, 2, 1),
                "Streaming Atualizado",
                "Gold",
                LocalDate.of(2025,1,1)
        );

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () -> {
            subscriptionService.update(subId, dto);
        });

        assertEquals("Assinatura não encontrada", ex.getMessage());
    }

    @Test
    void deleteSubscription_Success() {
        UUID subId = UUID.randomUUID();
        when(subscriptionRepository.existsById(subId)).thenReturn(true);

        assertDoesNotThrow(() -> subscriptionService.delete(subId));
        verify(subscriptionRepository).deleteById(subId);
    }

    @Test
    void deleteSubscription_NotFound_Throws() {
        UUID subId = UUID.randomUUID();
        when(subscriptionRepository.existsById(subId)).thenReturn(false);

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () -> {
            subscriptionService.delete(subId);
        });

        assertEquals("Assinatura não encontrada", ex.getMessage());
    }
}
