import { buttonVariants } from "@/components/ui/button";
import {
  GithubIcon,
  Linkedin02Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

// Plain links styled as icon buttons (a <button> wrapping an <a> is invalid HTML
// and only the tiny icon was clickable).
const links = [
  { href: "https://github.com/NamitBhutani", label: "GitHub", icon: GithubIcon },
  { href: "https://linkedin.com/in/namitbhutani", label: "LinkedIn", icon: Linkedin02Icon },
  { href: "mailto:namit.bhut@gmail.com", label: "Email", icon: Mail01Icon },
];

export function SocialLinks({ showEmail = true }: { showEmail?: boolean }) {
  return (
    <div className="flex gap-3">
      {links.filter((l) => showEmail || l.label !== "Email").map((l) => (
        <a
          key={l.label}
          href={l.href}
          target={l.href.startsWith("http") ? "_blank" : undefined}
          rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
          aria-label={l.label}
          title={l.label}
          className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
        >
          <HugeiconsIcon icon={l.icon} size={20} />
        </a>
      ))}
    </div>
  );
}
