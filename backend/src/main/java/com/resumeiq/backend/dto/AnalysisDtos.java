package com.resumeiq.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class AnalysisDtos {

    public record AnalysisRequest(
            @NotBlank(message = "resumeText must not be blank") String resumeText,
            @NotBlank(message = "jobDescription must not be blank") String jobDescription
    ) {}
}
