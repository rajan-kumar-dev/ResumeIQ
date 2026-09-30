export default function ScoreStamp({ score }) {
  const tone =
    score >= 75 ? "sage" : score >= 45 ? "brass" : "clay";

  const toneClasses = {
    sage: "border-sage text-sage",
    brass: "border-brass text-brass",
    clay: "border-clay text-clay",
  }[tone];

  const verdict =
    score >= 75 ? "Strong match" : score >= 45 ? "Partial match" : "Needs work";

  return (
    <div className="flex flex-col items-center animate-settle">
      <div
        className={`flex h-28 w-28 flex-col items-center justify-center rounded-full border-[3px] ${toneClasses}`}
        style={{ transform: "rotate(-3deg)" }}
      >
        <span className="font-display text-4xl leading-none">{score}</span>
        <span className="text-[10px] tracking-wide mt-1">out of 100</span>
      </div>
      <p className={`mt-3 text-sm font-medium ${toneClasses.split(" ")[1]}`}>{verdict}</p>
    </div>
  );
}
