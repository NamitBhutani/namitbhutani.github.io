interface ResearchCardProps {
  title: string;
  role: string;
  date: string;
  points: string[];
  advisors?: string;
  video?: string;
  poster?: string;
}

// Plain entry, same shape as the CV: title and dates, role and advisors, then points.
export function ResearchCard({
  title,
  role,
  advisors,
  date,
  points,
  video,
  poster,
}: ResearchCardProps) {
  return (
    <article>
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-8">
        <h3 className="text-base font-semibold leading-snug">{title}</h3>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">{date}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        <span className="italic">{role}</span>
        {advisors && <span>. Advisors: {advisors}</span>}
      </p>
      <ul className="mt-3 list-disc ml-4 text-sm space-y-1.5 leading-relaxed">
        {points.map((p: string, i: number) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </article>
  );
}
