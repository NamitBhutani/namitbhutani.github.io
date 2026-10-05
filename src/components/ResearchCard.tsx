import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ResearchCardProps {
  title: string;
  role: string;
  date: string;
  points: string[];
  advisors?: string;
}

export function ResearchCard({
  title,
  role,
  advisors,
  date,
  points,
}: ResearchCardProps) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex justify-between items-start gap-3">
          <div>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <p className="text-sm font-mono text-primary mt-1">{role}</p>
          </div>
          <Badge variant="secondary" className="shrink-0 font-mono">{date}</Badge>
        </div>
        {advisors && (
          <p className="text-xs text-muted-foreground mt-1">Advisors: {advisors}</p>
        )}
      </CardHeader>
      <CardContent>
        <ul className="list-disc ml-4 text-sm space-y-1.5 leading-relaxed text-card-foreground">
          {points.map((p: string, i: number) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
