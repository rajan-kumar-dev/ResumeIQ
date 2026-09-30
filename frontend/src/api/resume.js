import { apiFetch } from "./client";

/**
 * Uploads a resume file (PDF or DOCX) and returns the extracted plain text.
 */
export async function uploadResume(token, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch("/api/resume/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  return response.json(); // { extractedText, characterCount }
}
