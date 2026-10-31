import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
    <Card className="flex flex-col h-full hover:border-foreground/30 transition-colors">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
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
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
          >
            <HugeiconsIcon icon={GithubIcon} size={18} />
            Code
          </a>
        )}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "sm" }), "gap-2")}
          >
            <HugeiconsIcon icon={Link01Icon} size={18} />
            Demo
          </a>
        )}
      </CardFooter>
    </Card>
  );
}
