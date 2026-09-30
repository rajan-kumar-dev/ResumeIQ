package com.resumeiq.backend.controller;

import com.resumeiq.backend.dto.AnalysisDtos.AnalysisRequest;
import com.resumeiq.backend.service.AnalysisService;
import com.resumeiq.backend.rateLimit.RateLimitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;
    private final RateLimitService rateLimitService;

    @PostMapping(
            value = "/stream",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public ResponseEntity<Flux<String>> streamAnalysis(
            @Valid @RequestBody AnalysisRequest request,
            Authentication authentication) {

        String userKey = authentication.getName();

        if (!rateLimitService.allowRequest(userKey)) {

            Flux<String> errorStream = Flux.just(
                    "Too many requests. Please try again later."
            );

            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(errorStream);
        }

        Flux<String> analysisStream =
                analysisService
                        .streamAnalysis(
                                request.resumeText(),
                                request.jobDescription()
                        )
                        .onErrorResume(e ->
                                Flux.just(
                                        "\n\n**Error:** " + e.getMessage()
                                )
                        );

        return ResponseEntity.ok(analysisStream);
    }
}