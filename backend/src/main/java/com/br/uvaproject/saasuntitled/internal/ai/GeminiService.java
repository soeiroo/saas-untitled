package com.br.uvaproject.saasuntitled.internal.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

    public String generateFinancialAdvice(String prompt) {

        try {
            String url = GEMINI_URL + "?key=" + apiKey;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of(
                                    "parts", List.of(
                                            Map.of("text", prompt)
                                    )
                            )
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.POST,
                            entity,
                            Map.class
                    );

            return extractTextFromResponse(response.getBody());

        } catch (RestClientException e) {
            throw new RuntimeException("Erro ao chamar Gemini API", e);
        }
    }

    @SuppressWarnings("unchecked")
    private String extractTextFromResponse(Map<String, Object> body) {

        if (body == null || !body.containsKey("candidates")) {
            throw new RuntimeException("Resposta inválida da API Gemini");
        }

        List<Map<String, Object>> candidates =
                (List<Map<String, Object>>) body.get("candidates");

        if (candidates.isEmpty()) {
            throw new RuntimeException("Nenhuma resposta retornada pelo Gemini");
        }

        Map<String, Object> content =
                (Map<String, Object>) candidates.get(0).get("content");

        List<Map<String, Object>> parts =
                (List<Map<String, Object>>) content.get("parts");

        return parts.get(0).get("text").toString();
    }
}
