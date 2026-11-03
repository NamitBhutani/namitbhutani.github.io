import { Badge } from "@/components/ui/badge";

interface ExperienceProps {
  id?: string;
  role: string;
  company: string;
  period: string;
  description: string[];
  skills: string[];
}

export function ExperienceCard({
  id,
  role,
  company,
  period,
  description,
  skills,
}: ExperienceProps) {
  return (
    <div id={id} className="relative pl-8 border-l border-border pb-8 last:pb-0">
      <div className="absolute top-0 left-0 -translate-x-1/2 w-2.5 h-2.5 bg-foreground/40 rounded-full" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-8 mb-2">
        <h3 className="text-base font-semibold">{role}</h3>
        <span className="font-mono text-xs text-muted-foreground">
          {period}
        </span>
      </div>
      <div className="text-muted-foreground italic text-sm mb-3">{company}</div>
      <ul className="list-disc list-outside ml-4 space-y-1.5 text-sm text-foreground mb-3 leading-relaxed">
        {description.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      {skills.length > 0 && <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge key={skill} variant="outline" className="text-xs">
            {skill}
          </Badge>
        ))}
      </div>}
    </div>
  );
}
