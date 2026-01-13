package com.br.uvaproject.saasuntitled.internal.subscriptions;

import com.br.uvaproject.saasuntitled.internal.security.AuthenticatedUserService;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionCreateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionResponseDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionUpdateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.mapper.SubscriptionMapper;
import com.br.uvaproject.saasuntitled.internal.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final AuthenticatedUserService authenticatedUserService;

    @PostMapping
    public ResponseEntity<SubscriptionResponseDTO> create(
            Authentication authentication,
            @RequestBody SubscriptionCreateDTO dto
    ) {
        User user = authenticatedUserService.getUser(authentication);

        Subscription subscription = subscriptionService.create(user, dto);

        URI location = URI.create("/api/subscriptions/" + subscription.getId());

        return ResponseEntity
                .created(location)
                .body(SubscriptionMapper.toResponse(subscription));
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionResponseDTO>> getMySubscriptions(
            Authentication authentication
    ) {
        User user = authenticatedUserService.getUser(authentication);

        List<SubscriptionResponseDTO> response = subscriptionService.findMine(user)
                .stream()
                .map(SubscriptionMapper::toResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody SubscriptionUpdateDTO dto
    ) {
        User user = authenticatedUserService.getUser(authentication);

        subscriptionService.update(user, id, dto);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            Authentication authentication,
            @PathVariable UUID id
    ) {
        User user = authenticatedUserService.getUser(authentication);

        subscriptionService.delete(user, id);

        return ResponseEntity.noContent().build();
    }
}
