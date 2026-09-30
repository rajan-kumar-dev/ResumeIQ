import { useCallback, useRef, useState } from "react";
import { uploadResume } from "../api/resume";
import { useAuth } from "../context/AuthContext";

export default function ResumePanel({ onExtracted }) {
  const { auth } = useAuth();
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState(null);
  const [charCount, setCharCount] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      setStatus("loading");
      setError(null);
      setFileName(file.name);
      try {
        const result = await uploadResume(auth.token, file);
        setCharCount(result.characterCount);
        setStatus("done");
        onExtracted(result.extractedText);
      } catch (err) {
        setStatus("error");
        setError(err.message || "Couldn't read that file.");
        onExtracted("");
      }
    },
    [auth.token, onExtracted]
  );

  return (
    <div className="paper-shadow rounded-sm bg-parchment p-6 flex-1">
      <p className="text-xs font-medium uppercase tracking-wide text-parchment-text/50 mb-1">
        Document 1
      </p>
      <h2 className="font-display text-lg text-parchment-text mb-4">Your resume</h2>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`cursor-pointer rounded-sm border-2 border-dashed px-4 py-8 text-center transition-colors ${
          isDragOver
            ? "border-brass bg-brass/10"
            : "border-parchment-text/20 hover:border-parchment-text/35"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {status === "idle" && (
          <p className="text-sm text-parchment-text/60">
            Drop a PDF or DOCX here, or click to browse
          </p>
        )}
        {status === "loading" && (
          <p className="text-sm text-parchment-text/60">Reading {fileName}…</p>
        )}
        {status === "done" && (
          <div>
            <p className="text-sm font-medium text-parchment-text">{fileName}</p>
            <p className="text-xs text-sage mt-1">{charCount.toLocaleString()} characters extracted</p>
          </div>
        )}
        {status === "error" && (
          <div>
            <p className="text-sm font-medium text-clay">{fileName}</p>
            <p className="text-xs text-clay/80 mt-1">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
