import { Badge } from "@/components/ui/badge";

interface ExperienceProps {
  role: string;
  company: string;
  period: string;
  description: string[];
  skills: string[];
}

export function ExperienceCard({
  role,
  company,
  period,
  description,
  skills,
}: ExperienceProps) {
  return (
    <div className="relative pl-8 border-l border-border pb-8 last:pb-0">
      <div className="absolute top-0 left-0 -translate-x-1/2 w-3 h-3 bg-primary rounded-full" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
        <h3 className="text-lg font-bold">{role}</h3>
        <span className="font-mono text-xs text-muted-foreground">
          {period}
        </span>
      </div>
      <div className="text-primary font-mono text-sm mb-4">{company}</div>
      <ul className="list-disc list-outside ml-4 space-y-2 text-sm text-foreground mb-4">
        {description.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge key={skill} variant="outline" className="text-xs">
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  );
}
