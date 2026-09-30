import { API_BASE } from "./client";

export async function streamAnalysis(
  token,
  resumeText,
  jobDescription,
  onChunk
) {
  const response = await fetch(`${API_BASE}/api/analysis/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      resumeText,
      jobDescription,
    }),
  });

  if (!response.ok || !response.body) {
    const message = await response
      .json()
      .then((b) => b?.error)
      .catch(() => null);

    if (response.status === 429) {
      throw new Error(
        "You've reached your analysis limit. Please try again in a few minutes."
      );
    }

    throw new Error(
      message || "Something went wrong while analyzing your resume."
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";

  const contentType = response.headers
    .get("content-type")
    ?.toLowerCase() || "";

  const isSSE = contentType.includes("text/event-stream");

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    const chunk = decoder.decode(value, { stream: true });

    console.log("AI CHUNK RECEIVED:", chunk);

    // Normal/raw streaming response
    if (!isSSE) {
      onChunk(chunk);
      continue;
    }

    // SSE response
    buffer += chunk;

    let match;

    while ((match = buffer.match(/\r?\n\r?\n/)) !== null) {
      const boundary = match.index;
      const separatorLength = match[0].length;

      const rawEvent = buffer.slice(0, boundary);

      buffer = buffer.slice(boundary + separatorLength);

      const dataLines = rawEvent
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart());

      if (dataLines.length > 0) {
        onChunk(dataLines.join("\n"));
      }
    }
  }

  // Handle remaining SSE data
  if (buffer.trim()) {
    const dataLines = buffer
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart());

    if (dataLines.length > 0) {
      onChunk(dataLines.join("\n"));
    }
  }
}

export function parseAnalysis(fullText) {
  const normalized = fullText.replace(/\r\n/g, "\n");

  const getSection = (heading) => {
    const regex = new RegExp(
      `##\\s*${heading}\\s*\\n([\\s\\S]*?)(?=\\n##|$)`,
      "i"
    );

    const match = normalized.match(regex);

    return match ? match[1].trim() : "";
  };

  const scoreSection = getSection("Match Score");

  // Supports:
  // 85
  // 85/100
  // 85 / 100
  const scoreMatch =
    scoreSection.match(/\b(\d{1,3})\s*(?:\/\s*100)?\b/);

  const score = scoreMatch
    ? Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10)))
    : null;

  const parseList = (text) => {
    if (!text) return [];

    return text
      .split("\n")
      .map((line) =>
        line
          .replace(/^\s*[-*•]\s*/, "")
          .replace(/^\s*\d+\.\s*/, "")
          .trim()
      )
      .filter(Boolean);
  };

  return {
    score,
    matchingSkills: parseList(getSection("Matching Skills")),
    missingSkills: parseList(getSection("Missing Skills")),
    suggestions: parseList(getSection("Suggestions")),
  };
}