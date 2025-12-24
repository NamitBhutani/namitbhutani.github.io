import { Button } from "@/components/ui/button";
import {
  GithubIcon,
  Linkedin02Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function SocialLinks() {
  return (
    <div className="flex gap-4">
      <Button variant="outline" size="icon">
        <a href="https://github.com/namitbhut" aria-label="GitHub">
          <HugeiconsIcon icon={GithubIcon} size={20} />
        </a>
      </Button>
      <Button variant="outline" size="icon">
        <a href="https://linkedin.com/in/namitbhutani" aria-label="LinkedIn">
          <HugeiconsIcon icon={Linkedin02Icon} size={20} />
        </a>
      </Button>
      <Button variant="outline" size="icon">
        <a href="mailto:namit.bhut@gmail.com" aria-label="Email">
          <HugeiconsIcon icon={Mail01Icon} size={20} />
        </a>
      </Button>
    </div>
  );
}
