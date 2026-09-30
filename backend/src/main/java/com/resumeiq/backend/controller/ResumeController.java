package com.resumeiq.backend.controller;

import com.resumeiq.backend.dto.ResumeDtos.ResumeTextResponse;
import com.resumeiq.backend.service.ResumeParserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeParserService resumeParserService;

    /**
     * Accepts a PDF or DOCX resume, extracts and returns plain text.
     * The uploaded file is processed in-memory only and never persisted to disk or DB.
     */
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<ResumeTextResponse> uploadResume(@RequestParam("file") MultipartFile file) {
        String extractedText = resumeParserService.extractText(file);
        return ResponseEntity.ok(new ResumeTextResponse(extractedText, extractedText.length()));
    }
}
