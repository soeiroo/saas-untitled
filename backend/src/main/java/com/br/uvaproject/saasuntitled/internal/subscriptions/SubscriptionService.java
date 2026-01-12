package com.br.uvaproject.saasuntitled.internal.subscriptions;

import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionCreateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionUpdateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.mapper.SubscriptionMapper;
import com.br.uvaproject.saasuntitled.internal.users.User;
import com.br.uvaproject.saasuntitled.internal.users.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public Subscription create(UUID userId, SubscriptionCreateDTO dto) {

        if (dto.name() == null || dto.name().isBlank()) {
            throw new IllegalArgumentException("O nome da assinatura não pode estar vazio");
        }

        if (dto.price() == null) {
            throw new IllegalArgumentException("O preço da assinatura é obrigatório");
        }

        if (dto.renewalDate() == null) {
            throw new IllegalArgumentException("A data de renovação é obrigatória");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        Subscription sub = SubscriptionMapper.fromCreateDTO(dto);
        sub.setUser(user);

        return subscriptionRepository.save(sub);
    }

    public List<Subscription> findByUser(UUID userId) {

        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("Usuário não encontrado");
        }

        return subscriptionRepository.findByUserId(userId);
    }

    public Subscription update(UUID id, SubscriptionUpdateDTO dto) {

        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Assinatura não encontrada"));

        SubscriptionMapper.updateEntityFromDTO(sub, dto);

        return subscriptionRepository.save(sub);
    }

    public void delete(UUID id) {

        if (!subscriptionRepository.existsById(id)) {
            throw new EntityNotFoundException("Assinatura não encontrada");
        }

        subscriptionRepository.deleteById(id);
    }
}
