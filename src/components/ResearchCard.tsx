import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ResearchCard({ title, role, advisors, date, points }: any) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">{title}</CardTitle>
            <p className="text-sm font-mono text-primary mt-1">{role}</p>
          </div>
          <Badge variant="secondary">{date}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">Advisors: {advisors}</p>
      </CardHeader>
      <CardContent>
        <ul className="list-disc ml-4 text-sm space-y-1 text-muted-foreground">
          {points.map((p: string, i: number) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
