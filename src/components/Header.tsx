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
import { setupPixelate } from "@/lib/pixelate";
import { useEffect } from "react";

export function Header() {
  // Absolute anchors so the menu also works from /cv and /photoelasticity.
  const navItems = [
    { label: "Publications", href: "/#publications" },
    { label: "Research", href: "/#research" },
    { label: "Experience", href: "/#experience" },
    { label: "Projects", href: "/#projects" },
    { label: "Playground", href: "/playground" },
  ];

  // Every .pixelate surface swaps its blur for the #pixelate filter below, where the browser can.
  useEffect(() => setupPixelate(), []);

  return (
    <header className="pixelate sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      {/* Pixelation: average the backdrop a little (so single text strokes don't sparkle),
          sample it on an 8px grid, grow each sample into an 8px block, soften the block edges,
          and keep the result opaque so the blurs don't fade out at the edges. */}
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <filter id="pixelate" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="soft" />
          <feFlood x="4" y="4" width="1" height="1" />
          <feComposite width="8" height="8" />
          <feTile result="grid" />
          <feComposite in="soft" in2="grid" operator="in" />
          <feMorphology operator="dilate" radius="4" />
          <feGaussianBlur stdDeviation="0.5" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="1 1" />
          </feComponentTransfer>
        </filter>
        {/* One low-res pass each for the rerender animation (global.css): one sample per
            block, grown to fill it, like a viewport drawing at low resolution. No blur: it is
            what makes this slow in Firefox. Transparent stays transparent. */}
        {[8, 4, 2].map((b) => (
          <filter key={b} id={`resolve-${b}`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feFlood x={b / 2} y={b / 2} width="1" height="1" />
            <feComposite width={b} height={b} />
            <feTile result="grid" />
            <feComposite in="SourceGraphic" in2="grid" operator="in" />
            <feMorphology operator="dilate" radius={b / 2} />
          </filter>
        ))}
      </svg>
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
              {/* The trigger is the button itself; a <button> inside it broke hydration. */}
              <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
                <HugeiconsIcon icon={Menu01Icon} size={20} />
                <span className="sr-only">Toggle Menu</span>
              </SheetTrigger>
              <SheetContent side="right" className="p-6 w-72">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <SheetClose
                      nativeButton={false}
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
                      nativeButton={false}
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
