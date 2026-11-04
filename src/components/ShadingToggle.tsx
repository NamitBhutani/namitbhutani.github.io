import * as React from "react";
import { createPortal, flushSync } from "react-dom";
import { rerender } from "@/lib/motion";

// Viewport shading modes, after Blender's header: Wireframe, Solid, Rendered, plus a
// Statistics overlay. The mode lives on <html data-shading> and global.css styles it.
// It is not saved: every visit starts in Rendered, the normal page.

type Mode = "wireframe" | "solid" | "rendered";

const MODES: { id: Mode; label: string; icon: React.ReactNode }[] = [
  {
    id: "wireframe",
    label: "Wireframe",
    icon: (
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="8" cy="8" r="6.2" />
        <ellipse cx="8" cy="8" rx="2.6" ry="6.2" />
        <path d="M1.8 8h12.4M2.9 4.6h10.2M2.9 11.4h10.2" />
      </svg>
    ),
  },
  {
    id: "solid",
    label: "Solid",
    icon: (
      <svg viewBox="0 0 16 16" width="16" height="16">
        <circle cx="8" cy="8" r="6.2" fill="currentColor" opacity="0.55" />
      </svg>
    ),
  },
  {
    id: "rendered",
    label: "Rendered",
    icon: (
      <svg viewBox="0 0 16 16" width="16" height="16">
        <defs>
          <radialGradient id="shade-r" cx="0.35" cy="0.32" r="0.8">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.15" />
            <stop offset="1" stopColor="currentColor" stopOpacity="1" />
          </radialGradient>
        </defs>
        <circle cx="8" cy="8" r="6.2" fill="url(#shade-r)" />
      </svg>
    ),
  },
];

function Stats({ mode }: { mode: Mode }) {
  const [ms, setMs] = React.useState(0);
  const [counts, setCounts] = React.useState({ elements: 0, sections: 0, images: 0 });
  const [load, setLoad] = React.useState<number | null>(null);

  React.useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const samples: number[] = [];
    let lastShown = 0;
    const tick = (now: number) => {
      samples.push(now - last);
      last = now;
      if (samples.length > 60) samples.shift();
      if (now - lastShown > 250) {
        lastShown = now;
        setMs(samples.reduce((a, b) => a + b, 0) / samples.length);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    setCounts({
      elements: document.getElementsByTagName("*").length,
      sections: document.querySelectorAll("main section").length,
      images: document.querySelectorAll("main img, main video").length,
    });
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav && nav.loadEventEnd > 0) setLoad(nav.loadEventEnd);

    return () => cancelAnimationFrame(raf);
  }, []);

  const rows: [string, string][] = [
    ["Shading", mode[0].toUpperCase() + mode.slice(1)],
    ["Frame", ms ? `${ms.toFixed(1)} ms · ${Math.round(1000 / ms)} fps` : "…"],
    ["Elements", String(counts.elements)],
    ["Sections", String(counts.sections)],
    ["Images", String(counts.images)],
  ];
  if (load !== null) rows.push(["Load", `${Math.round(load)} ms`]);

  return (
    <div
      role="status"
      aria-live="off"
      className="hidden md:flex fixed bottom-3 right-3 z-50 items-center gap-3 font-mono text-[11px] h-7 px-3 bg-background/85 backdrop-blur pixelate ring-1 ring-foreground/15 text-muted-foreground"
    >
      {rows.map(([k, v]) => (
        <span key={k} className="whitespace-nowrap">
          {k} <span className="text-foreground tabular-nums">{v}</span>
        </span>
      ))}
    </div>
  );
}

function applyShading(mode: Mode) {
  const root = document.documentElement;
  if (mode === "rendered") root.removeAttribute("data-shading");
  else root.setAttribute("data-shading", mode);
}

export function ShadingToggle() {
  const [mode, setMode] = React.useState<Mode>("rendered");
  // Statistics overlay is on by default (?stats=0 turns it off).
  const [stats, setStats] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  // ?shading=wireframe|solid and ?stats=1 open the page in that mode (shareable links).
  React.useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const s = q.get("shading");
    if (s === "wireframe" || s === "solid" || s === "rendered") setMode(s);
    if (q.get("stats") === "0") setStats(false);
    setMounted(true);
  }, []);

  React.useEffect(() => applyShading(mode), [mode]);

  // Switching redraws the page low-res first, then sharp, like the viewport re-rendering.
  const switchTo = (m: Mode) => {
    if (m === mode) return;
    rerender(() => {
      applyShading(m);
      flushSync(() => setMode(m));
    });
  };

  const btn =
    "inline-flex h-8 w-8 md:w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground aria-pressed:bg-foreground/10 aria-pressed:text-foreground";

  return (
    <>
      <div className="flex items-center gap-1.5" aria-label="Viewport shading">
        <div className="flex ring-1 ring-foreground/15" role="group" aria-label="Shading mode">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={btn}
              aria-pressed={mode === m.id}
              title={`${m.label} shading`}
              onClick={() => switchTo(m.id)}
            >
              {m.icon}
              <span className="sr-only">{m.label} shading</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className={btn + " max-md:hidden ring-1 ring-foreground/15"}
          aria-pressed={stats}
          title="Statistics overlay"
          onClick={() => setStats((s) => !s)}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <rect x="2" y="9" width="2.5" height="5" />
            <rect x="6.75" y="5" width="2.5" height="9" />
            <rect x="11.5" y="2" width="2.5" height="12" />
          </svg>
          <span className="sr-only">Statistics overlay</span>
        </button>
      </div>
      {mounted && stats && createPortal(<Stats mode={mode} />, document.body)}
    </>
  );
}
