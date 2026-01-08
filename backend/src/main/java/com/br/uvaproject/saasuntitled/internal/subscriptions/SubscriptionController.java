package com.br.uvaproject.saasuntitled.internal.subscriptions;

import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionCreateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionResponseDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionUpdateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.mapper.SubscriptionMapper;
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
    public ResponseEntity<SubscriptionResponseDTO> create(
            @PathVariable UUID userId,
            @RequestBody SubscriptionCreateDTO dto
    ) {
        Subscription sub = subscriptionService.create(userId, dto);
        return ResponseEntity.ok(SubscriptionMapper.toResponse(sub));
    }

    @GetMapping("/user/{userId}")
    public List<SubscriptionResponseDTO> getByUser(@PathVariable UUID userId) {
        return subscriptionService.findByUser(userId)
                .stream()
                .map(SubscriptionMapper::toResponse)
                .toList();
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionResponseDTO> update(
            @PathVariable UUID id,
            @RequestBody SubscriptionUpdateDTO dto
    ) {
        Subscription sub = subscriptionService.update(id, dto);
        return ResponseEntity.ok(SubscriptionMapper.toResponse(sub));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        subscriptionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
