package com.resumeiq.backend.service;

import com.resumeiq.backend.exception.ResumeParsingException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;
import java.util.Set;

@Service
public class ResumeParserService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "docx");
    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024; // 5MB, matches application.yml

    /**
     * Extracts plain text from an uploaded resume file (PDF or DOCX).
     * The file itself is never persisted — only the extracted text is returned.
     */
    public String extractText(MultipartFile file) {
        validate(file);

        String extension = getExtension(file.getOriginalFilename());
        String text;

        try {
            text = switch (extension) {
                case "pdf" -> extractFromPdf(file.getInputStream());
                case "docx" -> extractFromDocx(file.getInputStream());
                default -> throw new ResumeParsingException("Unsupported file type: " + extension);
            };
        } catch (IOException e) {
            throw new ResumeParsingException("Could not read the uploaded file. It may be corrupted.", e);
        }

        if (text == null || text.isBlank()) {
            throw new ResumeParsingException(
                    "No readable text found in the file. If this is a scanned/image-based resume, " +
                    "text extraction won't work — try a text-based PDF or DOCX instead."
            );
        }

        return text.trim();
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResumeParsingException("No file was uploaded, or the file is empty.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ResumeParsingException("File is too large. Maximum allowed size is 5MB.");
        }

        String extension = getExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new ResumeParsingException(
                    "Unsupported file type '" + extension + "'. Only PDF and DOCX files are accepted."
            );
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            throw new ResumeParsingException("File has no extension; cannot determine its type.");
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }

    private String extractFromPdf(InputStream inputStream) throws IOException {
        try (PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {
            if (document.isEncrypted()) {
                throw new ResumeParsingException("This PDF is password-protected and cannot be read.");
            }
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String extractFromDocx(InputStream inputStream) throws IOException {
        try (XWPFDocument document = new XWPFDocument(inputStream);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        }
    }
}
