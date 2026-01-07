package com.br.uvaproject.saasuntitled.internal.subscriptions.controller;

import com.br.uvaproject.saasuntitled.internal.subscriptions.model.Subscription;
import com.br.uvaproject.saasuntitled.internal.subscriptions.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping("/user/{userId}")
    public ResponseEntity<Subscription> create(@PathVariable UUID userId, @RequestBody Subscription subscription) {
        return ResponseEntity.ok(subscriptionService.createSubscription(userId, subscription));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Subscription>> getByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(subscriptionService.getSubscriptionsByUser(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subscription> update(@PathVariable UUID id, @RequestBody Subscription subscription) {
        return ResponseEntity.ok(subscriptionService.updateSubscription(id, subscription));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        subscriptionService.deleteSubscription(id);
        return ResponseEntity.noContent().build();
    }
}
