package com.br.uvaproject.saasuntitled.internal.subscriptions.friends;

import com.br.uvaproject.saasuntitled.internal.security.AuthenticatedUserService;
import com.br.uvaproject.saasuntitled.internal.users.User;
import com.br.uvaproject.saasuntitled.internal.users.dto.UserSearchResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/subscriptions/{subscriptionId}/friends")
@RequiredArgsConstructor
public class SubscriptionFriendController {

    private final SubscriptionFriendService service;
    private final AuthenticatedUserService authenticatedUserService;

    @PostMapping("/{friendId}")
    public ResponseEntity<Void> addFriend(
            Authentication authentication,
            @PathVariable UUID subscriptionId,
            @PathVariable UUID friendId,
            @RequestBody(required = false) Map<String, BigDecimal> body
    ) {
        User user = authenticatedUserService.getUser(authentication);
        BigDecimal price = body != null ? body.get("price") : null;

        service.addFriendToSubscription(user, subscriptionId, friendId, price);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<UserSearchResponseDTO>> listFriends(
            Authentication authentication,
            @PathVariable UUID subscriptionId
    ) {
        User user = authenticatedUserService.getUser(authentication);
        List<UserSearchResponseDTO> friends = service.listFriends(subscriptionId, user);
        return ResponseEntity.ok(friends);
    }
    
    @PutMapping("/{friendId}/price")
    public ResponseEntity<Void> updateFriendPrice(
            Authentication authentication,
            @PathVariable UUID subscriptionId,
            @PathVariable UUID friendId,
            @RequestBody(required = false) Map<String, BigDecimal> body
    ) {
        User user = authenticatedUserService.getUser(authentication);
        BigDecimal price = body != null ? body.get("price") : null;

        service.updateFriendPrice(user, subscriptionId, friendId, price);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<Void> removeFriend(
            Authentication authentication,
            @PathVariable UUID subscriptionId,
            @PathVariable UUID friendId
    ) {
        User user = authenticatedUserService.getUser(authentication);
        service.removeFriendFromSubscription(user, subscriptionId, friendId);
        return ResponseEntity.noContent().build();
    }
}
