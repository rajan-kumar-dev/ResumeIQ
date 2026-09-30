function Chip({ label, tone }) {
  const classes =
    tone === "match"
      ? "bg-sage-bg text-sage-light border-sage/40"
      : "bg-clay-bg text-clay-light border-clay/40";

  return (
    <span className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}

export default function SkillChips({ matching, missing }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-parchment/50 mb-2">
          You've got this covered
        </p>
        <div className="flex flex-wrap gap-2">
          {matching.length > 0 ? (
            matching.map((skill) => <Chip key={skill} label={skill} tone="match" />)
          ) : (
            <p className="text-sm text-parchment/40">Nothing identified yet.</p>
          )}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-parchment/50 mb-2">
          Gaps to address
        </p>
        <div className="flex flex-wrap gap-2">
          {missing.length > 0 ? (
            missing.map((skill) => <Chip key={skill} label={skill} tone="missing" />)
          ) : (
            <p className="text-sm text-parchment/40">No gaps identified yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
