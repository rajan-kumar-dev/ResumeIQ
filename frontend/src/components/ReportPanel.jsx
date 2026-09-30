import ScoreStamp from "./ScoreStamp";
import SkillChips from "./SkillChips";

export default function ReportPanel({ status, rawText, parsed }) {
  if (status === "idle") return null;

  return (
    <div className="mt-10 rounded-sm border border-ink-border bg-ink-light overflow-hidden">

      {/* Header */}
      <div className="px-6 sm:px-8 pt-7 pb-6 border-b border-ink-border">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-parchment/40 mb-2">
              Match report
            </p>

            <h2 className="font-display text-2xl sm:text-3xl leading-tight">
              {status === "streaming"
                ? "Reading the fine print…"
                : "Here's how it stacks up"}
            </h2>

            {status === "done" && (
              <p className="mt-2 text-sm text-parchment/50">
                Based on the resume and job description you provided.
              </p>
            )}
          </div>

          {parsed.score !== null && (
            <div className="shrink-0">
              <ScoreStamp score={parsed.score} />
            </div>
          )}
        </div>
      </div>

      {/* Analysis content */}
      {status === "done" && (
        <div className="px-6 sm:px-8 py-7 space-y-8">

          {/* Skills */}
          {(parsed.matchingSkills.length > 0 ||
            parsed.missingSkills.length > 0) && (
            <section>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-parchment/40 mb-4">
                Skills analysis
              </p>

              <div className="rounded-sm border border-ink-border bg-ink/20 p-5 overflow-hidden">
                <SkillChips
                  matching={parsed.matchingSkills}
                  missing={parsed.missingSkills}
                />
              </div>
            </section>
          )}

          {/* Suggestions */}
          {parsed.suggestions.length > 0 && (
            <section>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-parchment/40 mb-4">
                Suggestions
              </p>

              <div className="space-y-3">
                {parsed.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-sm border border-ink-border bg-ink/20 px-4 sm:px-5 py-4"
                  >
                    <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full border border-brass/40 text-brass text-xs font-medium">
                      {index + 1}
                    </span>

                    <p className="min-w-0 flex-1 text-sm text-parchment/80 leading-7 break-words whitespace-normal">
                      {suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      )}

      {/* Streaming state */}
      {status === "streaming" && (
        <div className="px-6 sm:px-8 py-6">
          <div className="rounded-sm border border-ink-border bg-ink/20 p-5">
            <div className="font-mono text-xs text-parchment/40 whitespace-pre-wrap break-words leading-relaxed max-h-48 overflow-y-auto">
              {rawText}
              <span className="inline-block w-2 h-3.5 bg-brass ml-1 animate-blink align-middle" />
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="px-6 sm:px-8 py-6">
          <p className="text-sm text-clay-light bg-clay-bg/50 border border-clay/30 rounded-sm px-4 py-3 break-words">
            {rawText || "Something went wrong while generating the analysis."}
          </p>
        </div>
      )}

    </div>
  );
}