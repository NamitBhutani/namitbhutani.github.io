import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon, Link01Icon } from "@hugeicons/core-free-icons";

interface ProjectProps {
  title: string;
  description: string;
  tags: string[];
  link?: string;
  github?: string;
  image?: string; // todo: add screenshots
}

export function ProjectCard({
  title,
  description,
  tags,
  link,
  github,
}: ProjectProps) {
  return (
    <Card className="flex flex-col h-full hover:border-primary/50 transition-colors">
      <CardHeader>
        <CardTitle className="font-mono text-xl text-primary">
          {title}
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="font-mono text-xs rounded-none"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <CardDescription className="text-card-foreground leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex gap-2">
        {github && (
          <Button variant="outline" size="sm">
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <HugeiconsIcon icon={GithubIcon} size={20} />
              Code
            </a>
          </Button>
        )}
        {link && (
          <Button size="sm">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <HugeiconsIcon icon={Link01Icon} size={20} />
              Demo
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
