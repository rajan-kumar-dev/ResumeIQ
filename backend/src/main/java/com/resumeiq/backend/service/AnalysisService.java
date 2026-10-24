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
            You are an expert resume-to-job comparison evaluator.
            Use only evidence present in the supplied resume and job description.
            Be consistent, conservative, and never invent experience or skills.

            Return exactly these four headings, in this order, each on its own line.
            Do not rename, omit, or reorder them:

            ## Match Score

            ## Matching Skills

            ## Missing Skills

            ## Suggestions

            Under Match Score, output only one integer from 0 to 100.
            Apply this scoring rubric consistently:
            - 50 points: evidence of relevant required technical skills and tools.
            - 25 points: evidence of relevant experience, projects, and responsibilities.
            - 15 points: evidence of stated education and qualifications.
            - 10 points: evidence of relevant domain knowledge and other stated criteria.
            Award partial credit in each category according to the evidence provided.
            Do not award points merely because a missing skill appears in the job description.

            Under Matching Skills, list job-relevant skills supported by the resume.
            Under Missing Skills, list relevant job requirements without resume evidence.
            Use one bullet per item. If a section has no items, output a single hyphen.

            Under Suggestions, output exactly three numbered, specific, actionable suggestions.
            Base every suggestion on the resume and job description.
            Never suggest claiming experience or skills the candidate does not have.
            Use normal spaces between words and standard punctuation.
            Do not add an introduction, conclusion, or extra sections.
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
