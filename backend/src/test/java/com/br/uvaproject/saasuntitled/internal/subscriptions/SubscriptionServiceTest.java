package com.br.uvaproject.saasuntitled.internal.subscriptions;

import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionCreateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionResponseDTO;
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
        SubscriptionCreateDTO dto = validCreateDTO();

        when(subscriptionRepository.save(any(Subscription.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        SubscriptionResponseDTO response =
                subscriptionService.create(user, dto);

        assertNotNull(response);
        assertEquals("Netflix", response.name());
        assertEquals(new BigDecimal("29.90"), response.price());
        assertEquals("Streaming", response.category());
        assertEquals("Monthly", response.period());
        assertEquals("icon", response.icon());

        verify(subscriptionRepository).save(any(Subscription.class));
    }

    @Test
    void createSubscription_EmptyName_Throws() {
        SubscriptionCreateDTO dto = new SubscriptionCreateDTO(
                "",
                BigDecimal.TEN,
                LocalDate.now(),
                "Streaming",
                LocalDate.now(),
                "Premium",
                "Monthly",
                "icon"
        );

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> subscriptionService.create(user, dto)
        );

        assertEquals("O nome da assinatura não pode estar vazio", ex.getMessage());
    }

    @Test
    void findMine_ReturnsSubscriptions() {
        Subscription s1 = new Subscription();
        s1.setUser(user);
        s1.setName("Netflix");

        Subscription s2 = new Subscription();
        s2.setUser(user);
        s2.setName("Spotify");

        when(subscriptionRepository.findByUserId(user.getId()))
                .thenReturn(List.of(s1, s2));

        List<SubscriptionResponseDTO> result =
                subscriptionService.findMine(user);

        assertEquals(2, result.size());
        assertEquals("Netflix", result.get(0).name());
        assertEquals("Spotify", result.get(1).name());

        verify(subscriptionRepository).findByUserId(user.getId());
    }

    @Test
    void findSharedWithMe_ReturnsSubscriptions() {
        Subscription s1 = new Subscription();
        s1.setName("Netflix");
        s1.setUser(new User());

        Subscription s2 = new Subscription();
        s2.setName("Spotify");
        s2.setUser(new User());

        when(subscriptionRepository.findSubscriptionsWhereUserIsFriend(user.getId()))
                .thenReturn(List.of(s1, s2));

        List<SubscriptionResponseDTO> result =
                subscriptionService.findSharedWithMe(user);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Netflix", result.get(0).name());
        assertEquals("Spotify", result.get(1).name());

        verify(subscriptionRepository)
            .findSubscriptionsWhereUserIsFriend(user.getId());
    }

    @Test
    void updateSubscription_Success() {
        UUID id = UUID.randomUUID();

        Subscription subscription = new Subscription();
        subscription.setId(id);
        subscription.setUser(user);
        subscription.setName("Netflix");

        when(subscriptionRepository.findById(id))
                .thenReturn(Optional.of(subscription));

        when(subscriptionRepository.save(any(Subscription.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SubscriptionUpdateDTO dto = validUpdateDTO();

        SubscriptionResponseDTO response =
        subscriptionService.update(user, id, dto);

        assertNotNull(response);
        assertEquals(id, response.id());
        assertEquals("Netflix Updated", response.name());
        assertEquals(new BigDecimal("39.90"), response.price());

        verify(subscriptionRepository).save(subscription);
    }


    @Test
    void updateSubscription_NotOwner_Throws() {
        UUID id = UUID.randomUUID();

        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());

        Subscription subscription = new Subscription();
        subscription.setId(id);
        subscription.setUser(otherUser);

        when(subscriptionRepository.findById(id))
                .thenReturn(Optional.of(subscription));

        assertThrows(EntityNotFoundException.class, () ->
                subscriptionService.update(user, id, validUpdateDTO())
        );
    }

    @Test
    void deleteSubscription_Success() {
        UUID id = UUID.randomUUID();

        Subscription subscription = new Subscription();
        subscription.setId(id);
        subscription.setUser(user);

        when(subscriptionRepository.findById(id))
                .thenReturn(Optional.of(subscription));

        assertDoesNotThrow(() ->
                subscriptionService.delete(user, id)
        );

        verify(subscriptionRepository).delete(subscription);
    }
    
    @Test
    void deleteSubscription_NotFound_Throws() {
        UUID id = UUID.randomUUID();
        
        when(subscriptionRepository.findById(id))
                .thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> subscriptionService.delete(user, id)
        );

        assertEquals("Assinatura não encontrada", ex.getMessage());

        verify(subscriptionRepository, never()).delete(any());
    }

    private SubscriptionCreateDTO validCreateDTO() {
        return new SubscriptionCreateDTO(
                "Netflix",
                new BigDecimal("29.90"),
                LocalDate.now().plusDays(30),
                "Streaming",
                LocalDate.now(),
                "Premium",
                "Monthly",
                "icon"
        );
    }

    private SubscriptionUpdateDTO validUpdateDTO() {
        return new SubscriptionUpdateDTO(
                "Netflix Updated",
                new BigDecimal("39.90"),
                LocalDate.now().plusDays(60),
                "Streaming",
                "Premium",
                "Yearly",
                "icon",
                LocalDate.now()
        );
    }
}
