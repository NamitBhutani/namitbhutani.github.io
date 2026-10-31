import { HugeiconsIcon } from "@hugeicons/react";
import {
  Menu01Icon,
  Download01Icon,
} from "@hugeicons/core-free-icons";
import { ModeToggle } from "./ModeToggle";
import { ShadingToggle } from "./ShadingToggle";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function Header() {
  // Absolute anchors so the menu also works from /cv and /photoelasticity.
  const navItems = [
    { label: "Publications", href: "/#publications" },
    { label: "Research", href: "/#research" },
    { label: "Experience", href: "/#experience" },
    { label: "Projects", href: "/#projects" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto w-full max-w-7xl flex h-14 items-center justify-between px-4 sm:px-6 lg:px-10">
        <a href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-semibold tracking-tight">Namit Bhutani</span>
        </a>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition-colors text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
            <a
              href="/Namit_Bhutani_CV.pdf" target="_blank" rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "default" }), "ml-2 text-sm gap-1.5")}
            >
              CV <HugeiconsIcon icon={Download01Icon} size={18} />
            </a>
          </nav>
          <div className="hidden md:block">
            <ShadingToggle />
          </div>
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
                          className="text-lg font-medium transition-colors hover:text-primary"
                        />
                      }
                    >
                      {item.label}
                    </SheetClose>
                  ))}
                  <SheetClose
                    render={
                      <a
                        href="/Namit_Bhutani_CV.pdf" target="_blank" rel="noopener noreferrer"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "default" }),
                          "mt-4 text-sm w-full gap-1.5"
                        )}
                      />
                    }
                  >
                    CV <HugeiconsIcon icon={Download01Icon} size={18} />
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
