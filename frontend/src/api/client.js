export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Parses a JSON error body from the backend's GlobalExceptionHandler shape:
 * { timestamp, status, error }. Falls back to a generic message.
 */
async function extractErrorMessage(response) {
  try {
    const body = await response.json();
    if (body?.error) return body.error;
  } catch {
    // response wasn't JSON
  }
  return `Request failed with status ${response.status}`;
}

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }
  return response;
}
