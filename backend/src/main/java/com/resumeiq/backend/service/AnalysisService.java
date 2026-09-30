package com.resumeiq.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final AnthropicClient anthropicClient;

    // The exact structure is enforced so the frontend can reliably parse out
    // the score, skill lists, and suggestions once streaming completes.
    private static final String SYSTEM_PROMPT = """
            You are an expert technical recruiter and resume coach. You will be given \
            a candidate's resume text and a job description. Compare them carefully \
            and respond using EXACTLY this markdown structure, with no extra text \
            before or after it:

            ## Match Score
            <a single integer from 0 to 100>

            ## Matching Skills
            - <skill found in both the resume and the job description>

            ## Missing Skills
            - <skill required by the job description but not evidenced in the resume>

            ## Suggestions
            1. <specific, actionable suggestion to improve the resume for this role>
            2. <another suggestion>
            3. <another suggestion>

            Base every claim only on the text provided. Do not invent skills, \
            companies, or experience that isn't in the resume.
            """;

    public Flux<String> streamAnalysis(String resumeText, String jobDescription) {
        String userPrompt = """
                RESUME:
                %s

                JOB DESCRIPTION:
                %s
                """.formatted(resumeText, jobDescription);

        return anthropicClient.streamCompletion(SYSTEM_PROMPT, userPrompt);
    }
}
