import { HugeiconsIcon } from "@hugeicons/react";
import {
  Menu01Icon,
  Home01Icon,
  CodeIcon,
  BookOpen01Icon,
  UserIcon,
  Download01Icon,
} from "@hugeicons/core-free-icons";
import { ModeToggle } from "./ModeToggle";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function Header() {
  const navItems = [
    { label: "Home", href: "#home", icon: Home01Icon },
    { label: "Projects", href: "#projects", icon: CodeIcon },
    { label: "Research", href: "#research", icon: BookOpen01Icon },
    { label: "Experience", href: "#experience", icon: UserIcon },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-8">
        <a href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold font-mono text-xl text-primary">~/ </span>
        </a>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-primary flex items-center gap-2"
              >
                <HugeiconsIcon icon={item.icon} size={16} />
                {item.label}
              </a>
            ))}
            <a
              href="/Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "default" }), "ml-4 font-mono text-sm")}
            >
              Resume <HugeiconsIcon icon={Download01Icon} size={20} />
            </a>
          </nav>
          <ModeToggle />
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger>
                <button className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
                  <HugeiconsIcon icon={Menu01Icon} size={20} />
                  <span className="sr-only">Toggle Menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="p-6 w-72">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <SheetClose
                      key={item.href}
                      render={
                        <a
                          href={item.href}
                          className="flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary"
                        />
                      }
                    >
                      <HugeiconsIcon icon={item.icon} size={20} />
                      {item.label}
                    </SheetClose>
                  ))}
                  <SheetClose
                    render={
                      <a
                        href="/Resume.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "default" }),
                          "mt-4 font-mono text-sm w-full"
                        )}
                      />
                    }
                  >
                    Resume <HugeiconsIcon icon={Download01Icon} size={20} />
                  </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
