export default function JobDescriptionPanel({ value, onChange }) {
  return (
    <div className="paper-shadow rounded-sm bg-parchment p-6 flex-1 flex flex-col">
      <p className="text-xs font-medium uppercase tracking-wide text-parchment-text/50 mb-1">
        Document 2
      </p>
      <h2 className="font-display text-lg text-parchment-text mb-4">The job</h2>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description here…"
        className="flex-1 min-h-[176px] w-full resize-none rounded-sm border border-parchment-text/15 bg-white/40 px-3 py-3 text-sm text-parchment-text outline-none focus:border-brass focus:ring-2 focus:ring-brass/30"
      />
    </div>
  );
}
