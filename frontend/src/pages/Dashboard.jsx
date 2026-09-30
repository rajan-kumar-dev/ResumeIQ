import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { streamAnalysis, parseAnalysis } from "../api/analysis";
import TopBar from "../components/TopBar";
import ResumePanel from "../components/ResumePanel";
import JobDescriptionPanel from "../components/JobDescriptionPanel";
import ReportPanel from "../components/ReportPanel";

const EMPTY_PARSED = { score: null, matchingSkills: [], missingSkills: [], suggestions: [] };

export default function Dashboard() {
  const { auth } = useAuth();

  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [status, setStatus] = useState("idle"); // idle | streaming | done | error
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState(EMPTY_PARSED);

  const canAnalyze = resumeText.trim().length > 0 && jobDescription.trim().length > 0;

  async function handleAnalyze() {
    setStatus("streaming");
    setRawText("");
    setParsed(EMPTY_PARSED);

    let accumulated = "";
    try {
      await streamAnalysis(auth.token, resumeText, jobDescription, (chunk) => {
        accumulated += chunk;
        setRawText(accumulated);
        setParsed(parseAnalysis(accumulated));
      });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setRawText(err.message || "The analysis couldn't be completed.");
    }
  }

  return (
    <div className="min-h-full">
      <TopBar />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="font-display text-3xl md:text-4xl leading-tight max-w-xl">
            Compare your resume to the role.
          </h1>
          <p className="mt-3 text-parchment/60 max-w-md">
            Drop in your resume and the job you're after — we'll show you exactly
            where you line up, and where you don't.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <ResumePanel onExtracted={setResumeText} />
          <JobDescriptionPanel value={jobDescription} onChange={setJobDescription} />
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze || status === "streaming"}
            className="rounded-sm bg-brass px-8 py-3 text-sm font-semibold text-ink transition-colors hover:bg-brass-light disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === "streaming" ? "Analyzing…" : "Analyze match"}
          </button>
        </div>

        <ReportPanel status={status} rawText={rawText} parsed={parsed} />
      </main>
    </div>
  );
}
