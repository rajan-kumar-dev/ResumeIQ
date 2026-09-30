package com.resumeiq.backend.dto;

public class ResumeDtos {

    public record ResumeTextResponse(
            String extractedText,
            int characterCount
    ) {}
}
