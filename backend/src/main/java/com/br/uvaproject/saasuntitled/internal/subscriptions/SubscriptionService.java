package com.br.uvaproject.saasuntitled.internal.subscriptions;

import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionCreateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionResponseDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionUpdateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.mapper.SubscriptionMapper;
import com.br.uvaproject.saasuntitled.internal.subscriptions.friends.SubscriptionFriendRepository;
import com.br.uvaproject.saasuntitled.internal.users.User;
import com.br.uvaproject.saasuntitled.internal.ai.GeminiService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Transactional
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionFriendRepository subscriptionFriendRepository;
    private final GeminiService geminiService;

    public SubscriptionResponseDTO create(User user, SubscriptionCreateDTO dto) {

        validateCreate(dto);

        Subscription subscription = SubscriptionMapper.fromCreateDTO(dto);
        subscription.setUser(user);

        subscriptionRepository.save(subscription);

        return SubscriptionMapper.toResponse(subscription);
    }

    @Transactional(readOnly = true)
    public List<SubscriptionResponseDTO> findMine(User user) {
        return subscriptionRepository.findByUserId(user.getId())
                .stream()
                .map(SubscriptionMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SubscriptionResponseDTO> findSharedWithMe(User user) {
        return subscriptionFriendRepository
                .findByFriendId(user.getId())
                .stream()
                .map(sf -> SubscriptionMapper.toResponse(sf.getSubscription(), sf.getPrice()))
                .toList();
    }

    public SubscriptionResponseDTO update(
            User user,
            UUID subscriptionId,
            SubscriptionUpdateDTO dto) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new EntityNotFoundException("Assinatura não encontrada"));

        if (!subscription.getUser().getId().equals(user.getId())) {
            throw new EntityNotFoundException("Assinatura não encontrada");
        }

        validateUpdate(dto);

        SubscriptionMapper.updateEntityFromDTO(subscription, dto);

        Subscription updated = subscriptionRepository.save(subscription);

        return SubscriptionMapper.toResponse(updated);
    }

    public void delete(User user, UUID subscriptionId) {

        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new EntityNotFoundException("Assinatura não encontrada"));

        if (!subscription.getUser().getId().equals(user.getId())) {
            throw new EntityNotFoundException("Assinatura não encontrada");
        }

        subscriptionRepository.delete(subscription);
    }

    private void validateCreate(SubscriptionCreateDTO dto) {

        if (dto.name() == null || dto.name().isBlank()) {
            throw new IllegalArgumentException("O nome da assinatura não pode estar vazio");
        }

        if (dto.price() == null) {
            throw new IllegalArgumentException("O preço da assinatura é obrigatório");
        }

        if (dto.renewalDate() == null) {
            throw new IllegalArgumentException("A data de renovação é obrigatória");
        }

        if (dto.category() == null || dto.category().isBlank()) {
            throw new IllegalArgumentException("A categoria da assinatura é obrigatória");
        }
    }

    private void validateUpdate(SubscriptionUpdateDTO dto) {

        if (dto.name() != null && dto.name().isBlank()) {
            throw new IllegalArgumentException("O nome da assinatura não pode estar vazio");
        }

        if (dto.category() != null && dto.category().isBlank()) {
            throw new IllegalArgumentException("A categoria da assinatura é obrigatória");
        }
    }

          public String generateSpendingAdvice(User user) {

        List<SubscriptionResponseDTO> mine = findMine(user);
        List<SubscriptionResponseDTO> shared = findSharedWithMe(user);

        BigDecimal totalMensal = BigDecimal.ZERO;

        StringBuilder prompt = new StringBuilder();
        prompt.append("Você é um consultor financeiro.\n");
        prompt.append("Analise minhas assinaturas e me dê sugestões objetivas para economizar dinheiro.\n\n");

        prompt.append("=== Minhas Assinaturas ===\n");

        for (SubscriptionResponseDTO s : mine) {

            BigDecimal valorConsiderado =
                    s.sharedPrice() != null ? s.sharedPrice() : s.price();

            totalMensal = totalMensal.add(
                    normalizeToMonthly(valorConsiderado, s.period())
            );

            prompt.append("- Nome: ").append(s.name())
                    .append("\n  Categoria: ").append(s.category())
                    .append("\n  Plano: ").append(s.plan())
                    .append("\n  Valor: R$ ").append(valorConsiderado)
                    .append("\n  Período: ").append(s.period())
                    .append("\n  Renovação: ").append(s.renewalDate())
                    .append("\n\n");
        }

        prompt.append("=== Assinaturas Compartilhadas Comigo ===\n");

        for (SubscriptionResponseDTO s : shared) {

            BigDecimal valorConsiderado =
                    s.sharedPrice() != null ? s.sharedPrice() : s.price();

            totalMensal = totalMensal.add(
                    normalizeToMonthly(valorConsiderado, s.period())
            );

            prompt.append("- Nome: ").append(s.name())
                    .append("\n  Categoria: ").append(s.category())
                    .append("\n  Plano: ").append(s.plan())
                    .append("\n  Valor: R$ ").append(valorConsiderado)
                    .append("\n  Período: ").append(s.period())
                    .append("\n  Renovação: ").append(s.renewalDate())
                    .append("\n\n");
        }

        prompt.append("=== Resumo ===\n");
        prompt.append("Total mensal estimado: R$ ").append(totalMensal).append("\n\n");

        prompt.append("""
                Com base nesses dados:
                1. Aponte assinaturas que podem ser canceladas
                2. Sugira alternativas mais baratas
                3. Identifique categorias com gastos excessivos
                4. Seja direto e prático
                """);

        return geminiService.generateFinancialAdvice(prompt.toString());
    }

    private BigDecimal normalizeToMonthly(BigDecimal value, String period) {

        if (value == null || period == null) {
            return BigDecimal.ZERO;
        }

        return switch (period.toLowerCase()) {
            case "monthly", "mensal" -> value;
            case "yearly", "anual" -> value.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
            case "weekly", "semanal" -> value.multiply(BigDecimal.valueOf(4));
            default -> value;
        };
    }
}
