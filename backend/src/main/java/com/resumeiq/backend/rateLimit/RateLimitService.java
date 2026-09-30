package com.resumeiq.backend.rateLimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket createBucket() {

        Bandwidth limit = Bandwidth.builder()
                .capacity(5)
                .refillGreedy(5, Duration.ofMinutes(10))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    public boolean allowRequest(String key) {

        Bucket bucket = buckets.computeIfAbsent(
                key,
                k -> createBucket()
        );

        boolean allowed = bucket.tryConsume(1);

        System.out.println(
                "RATE LIMIT | user=" + key +
                        " | allowed=" + allowed +
                        " | remaining=" + bucket.getAvailableTokens()
        );

        return allowed;
    }
}