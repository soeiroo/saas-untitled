package com.br.uvaproject.saasuntitled.internal.subscriptions;

import com.br.uvaproject.saasuntitled.internal.security.AuthenticatedUserService;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionCreateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionResponseDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionUpdateDTO;
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

        SubscriptionResponseDTO response =
                subscriptionService.create(user, dto);

        URI location = URI.create("/api/subscriptions");

        return ResponseEntity
                .created(location)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionResponseDTO>> getMySubscriptions(
            Authentication authentication
    ) {
        User user = authenticatedUserService.getUser(authentication);

        return ResponseEntity.ok(subscriptionService.findMine(user));
    }

    @GetMapping("/shared")
    public ResponseEntity<List<SubscriptionResponseDTO>> getSharedWithMe(
            Authentication authentication
    ) {
        User user = authenticatedUserService.getUser(authentication);
        return ResponseEntity.ok(subscriptionService.findSharedWithMe(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionResponseDTO> update(
        Authentication authentication,
        @PathVariable UUID id,
        @RequestBody SubscriptionUpdateDTO dto
    ) {
        User user = authenticatedUserService.getUser(authentication);

        SubscriptionResponseDTO response =
                subscriptionService.update(user, id, dto);

        return ResponseEntity.ok(response);
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
