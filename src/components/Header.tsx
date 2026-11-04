import { HugeiconsIcon } from "@hugeicons/react";
import {
  Menu01Icon,
  Download01Icon,
} from "@hugeicons/core-free-icons";
import { ModeToggle } from "./ModeToggle";
import { ShadingToggle } from "./ShadingToggle";
import { Search } from "./Search";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { setupPixelate } from "@/lib/pixelate";
import { useEffect, useState } from "react";
import { homeOutline, pages } from "@/data/outline";
import { profile } from "@/data/profile";

// Blender's top bar: workspace tabs. Just Layout and Playground; the paper page is linked
// from the bio and its publication (and listed in the mobile menu and F3 search).
const WORKSPACES = [
  { href: "/", label: "Layout" },
  { href: "/playground", label: "Playground" },
];

// Local time where Namit is, like a status readout; client-only, so it can't mismatch the
// server-rendered HTML.
function Clock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: profile.clock.timeZone });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  return (
    <span
      className="hidden lg:inline font-mono text-sm text-muted-foreground tabular-nums whitespace-nowrap"
      title={`Local time for Namit (${profile.clock.city})`}
    >
      {profile.clock.city} <span className="text-foreground">{time || "--:--"}</span>
    </span>
  );
}

// `outliner`: the home page, whose three columns make the header wider on big screens.
export function Header({ outliner = false }: { outliner?: boolean }) {
  // Every .pixelate surface swaps its blur for the #pixelate filter below, where the browser can.
  useEffect(() => setupPixelate(), []);

  // The menu's Outliner selects the page you're on (on the home page, src/lib/outliner.ts
  // selects the section instead).
  const [path, setPath] = useState("");
  useEffect(() => setPath(location.pathname.replace(/\/$/, "") || "/"), []);

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
      {/* On the home page, as wide as its three columns. */}
      <div className={cn("mx-auto w-full max-w-7xl flex h-14 items-center justify-between px-4 sm:px-6 lg:px-10", outliner && "xl:max-w-[88rem] 2xl:max-w-[100rem] xl:px-8 min-[90rem]:px-12")}>
        <div className="flex items-center gap-5 min-w-0">
          <a href="/" className="flex items-center shrink-0">
            <span className="text-[17px] font-semibold tracking-tight">Namit Bhutani</span>
          </a>
          <nav aria-label="Workspaces" className="hidden md:flex items-center">
            {WORKSPACES.map((w) => (
              <a
                key={w.href}
                href={w.href}
                aria-current={path === w.href ? "page" : undefined}
                className="h-8 px-3 flex items-center text-[15px] text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:bg-foreground/10 aria-[current=page]:text-foreground"
              >
                {w.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          <Clock />
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <Search />
            <a
              href="/Namit_Bhutani_CV.pdf" target="_blank" rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "default" }), "text-[15px] gap-1.5")}
            >
              CV <HugeiconsIcon icon={Download01Icon} size={18} />
            </a>
          </div>
          <ShadingToggle />
          <ModeToggle />
          {/* The menu (an Outliner) wherever the page's own Outliner isn't shown: phones, and on
              the home page every width below the three-column layout (xl). */}
          <div className={outliner ? "xl:hidden" : "md:hidden"}>
            <Sheet>
              {/* The trigger is the button itself; a <button> inside it broke hydration. */}
              <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
                <HugeiconsIcon icon={Menu01Icon} size={20} />
                <span className="sr-only">Toggle Menu</span>
              </SheetTrigger>
              {/* The menu is the phone's Outliner: the site as a scene tree, after Blender's. */}
              <SheetContent side="right" className="outliner-sheet p-0 gap-0 w-72">
                <div className="flex items-center h-14 px-4 bg-muted border-b border-border text-sm font-medium select-none">
                  Outliner
                </div>
                <nav aria-label="Site" className="py-2 text-[15px] overflow-y-auto">
                  <div className="flex items-center gap-2 h-9 px-4 text-muted-foreground">
                    <span aria-hidden="true" className="outliner-collection" />
                    Scene Collection
                  </div>
                  <ul className="ml-[1.4rem] border-l border-border">
                    <li>
                      <SheetClose nativeButton={false} render={<a href="/" className="outliner-row h-10" />}>
                        <span aria-hidden="true" className="outliner-collection" />
                        <span className="flex-1">Home</span>
                      </SheetClose>
                      <ul className="ml-[1.4rem] border-l border-border">
                        {homeOutline.map((o) => (
                          <li key={o.id}>
                            <SheetClose
                              nativeButton={false}
                              render={<a href={`/#${o.id}`} data-outline={o.id} className="outliner-row h-10" />}
                            >
                              <span aria-hidden="true" className="outliner-object" />
                              <span className="flex-1 truncate">{o.label}</span>
                              {o.count !== undefined && <span className="font-mono text-xs text-muted-foreground">{o.count}</span>}
                            </SheetClose>
                          </li>
                        ))}
                      </ul>
                    </li>
                    {pages.map((p) => (
                      <li key={p.href}>
                        <SheetClose
                          nativeButton={false}
                          render={
                            <a href={p.href} aria-current={path === p.href ? "page" : undefined} className="outliner-row h-10" />
                          }
                        >
                          <span aria-hidden="true" className="outliner-collection" />
                          <span className="flex-1">{p.label}</span>
                        </SheetClose>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="px-4 pt-2 pb-6">
                  <SheetClose
                    nativeButton={false}
                    render={
                      <a
                        href="/Namit_Bhutani_CV.pdf" target="_blank" rel="noopener noreferrer"
                        className={cn(buttonVariants({ variant: "outline", size: "default" }), "text-sm w-full gap-1.5")}
                      />
                    }
                  >
                    CV <HugeiconsIcon icon={Download01Icon} size={18} />
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
