package com.resumeiq.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

/**
 * Thin client around Anthropic's /v1/messages streaming endpoint.
 * Consumes the raw SSE stream and emits only the text deltas as they arrive,
 * so callers don't need to know anything about Anthropic's event format.
 */
@Service
public class AnthropicClient {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.anthropic.api-key}")
    private String apiKey;

    @Value("${app.anthropic.base-url}")
    private String baseUrl;

    @Value("${app.anthropic.model}")
    private String model;

    @Value("${app.anthropic.max-tokens}")
    private int maxTokens;

    public AnthropicClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public Flux<String> streamCompletion(String systemPrompt, String userPrompt) {
        if (apiKey == null || apiKey.isBlank()) {
            return Flux.error(new IllegalStateException(
                    "OPENROUTER_API_KEY is not set. Export it as an environment variable before calling this endpoint."));
        }

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "max_tokens", maxTokens,
                "stream", true,
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content", systemPrompt
                        ),
                        Map.of(
                                "role", "user",
                                "content", userPrompt
                        )
                )
        );
        return webClient.post()
                .uri(baseUrl)
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(
                        new ParameterizedTypeReference<ServerSentEvent<String>>() {}
                )
                .flatMap(this::extractTextDelta)
                .doOnNext(text -> System.out.println("AI CHUNK >>> " + text))
                .doOnError(error -> System.out.println("AI ERROR >>> " + error.getMessage()));
    }

    private Flux<String> extractTextDelta(ServerSentEvent<String> event) {

        String data = event.data();

        if (data == null || data.isBlank() || "[DONE]".equals(data)) {
            return Flux.empty();
        }

        try {
            JsonNode node = objectMapper.readTree(data);

            JsonNode content = node
                    .path("choices")
                    .path(0)
                    .path("delta")
                    .path("content");

            if (!content.isMissingNode() && !content.isNull()) {
                String text = content.asText();

                if (!text.isEmpty()) {
                    return Flux.just(text);
                }
            }

        } catch (Exception e) {
            return Flux.empty();
        }

        return Flux.empty();
    }
}
