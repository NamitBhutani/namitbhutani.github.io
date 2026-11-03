import * as React from "react";
import { createPortal } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { homeOutline, pages } from "@/data/outline";
import { profile } from "@/data/profile";

// Search, after Blender's F3 menu search: F3 (or /) opens a field over the page; type to
// filter everything on the site, shown as menu paths ("Home ▸ Research ▸ LegalTree").
// Results are real links, so jumping on the page gets the same selection flash as a click.

type Result = { path: string[]; href: string; external?: boolean; keywords?: string };

const RESULTS: Result[] = [
  { path: ["Workspace", "Layout"], href: "/", keywords: "home" },
  ...pages.map((p) => ({ path: ["Workspace", p.label], href: p.href })),
  ...homeOutline.flatMap((s) => [
    { path: ["Home", s.label], href: `/#${s.id}` },
    ...(s.children ?? []).map((c) => ({ path: ["Home", s.label, c.label], href: `/#${c.id}` })),
  ]),
  { path: ["Links", "Curriculum Vitae"], href: "/Namit_Bhutani_CV.pdf", external: true, keywords: "cv resume pdf" },
  { path: ["Links", "Email"], href: `mailto:${profile.email}`, keywords: profile.email },
  { path: ["Links", "Google Scholar"], href: profile.scholar, external: true },
  { path: ["Links", "GitHub"], href: profile.github, external: true, keywords: "code" },
  { path: ["Links", "LinkedIn"], href: profile.linkedin, external: true },
];

function matches(r: Result, query: string) {
  const hay = (r.path.join(" ") + " " + (r.keywords ?? "")).toLowerCase();
  return query.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
}

export function Search() {
  const [open, setOpen] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const input = React.useRef<HTMLInputElement>(null);
  const list = React.useRef<HTMLUListElement>(null);
  const opener = React.useRef<HTMLElement | null>(null);

  const results = React.useMemo(() => RESULTS.filter((r) => matches(r, query)), [query]);

  const show = React.useCallback(() => {
    opener.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setActive(0);
    setClosing(false);
    setOpen(true);
  }, []);
  // Folds up, then unmounts (.search-pop[data-closing], global.css); at once under reduced motion.
  const close = React.useCallback(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) setOpen(false);
    else setClosing(true);
  }, []);
  const hide = React.useCallback(() => {
    close();
    opener.current?.focus?.();
  }, [close]);

  // F3 anywhere, or / when not typing in a field.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as Element)?.closest?.("input, textarea, [contenteditable=true]");
      if (e.key === "F3" || (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey)) {
        e.preventDefault();
        show();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [show]);

  React.useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  // Keep the highlighted result in view.
  React.useEffect(() => {
    list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (i: number) => {
    const a = list.current?.children[i]?.querySelector("a");
    close();
    a?.click();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      hide();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(active);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-label="Search the site (F3)"
        className="inline-flex items-center gap-2 h-8 px-2.5 lg:pr-1.5 ring-1 ring-foreground/15 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <HugeiconsIcon icon={Search01Icon} size={16} />
        <span className="hidden lg:inline">Search</span>
        <kbd className="hidden lg:inline font-mono text-[11px] px-1 bg-foreground/10">F3</kbd>
      </button>
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[60]" onMouseDown={(e) => e.target === e.currentTarget && hide()}>
            <div
              role="dialog"
              aria-label="Search"
              onKeyDown={onKeyDown}
              data-closing={closing || undefined}
              onAnimationEnd={() => {
                if (closing) {
                  setOpen(false);
                  setClosing(false);
                }
              }}
              className="search-pop mx-auto mt-16 w-[min(34rem,calc(100vw-2rem))] bg-popover text-popover-foreground ring-1 ring-foreground/15 shadow-2xl"
            >
              <div className="flex items-center gap-2 h-10 px-3 border-b border-border">
                <HugeiconsIcon icon={Search01Icon} size={15} className="text-muted-foreground" />
                <input
                  ref={input}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  placeholder="Search…"
                  aria-label="Search the site"
                  aria-controls="search-results"
                  aria-activedescendant={results[active] ? `search-result-${active}` : undefined}
                  className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="font-mono text-[10px] px-1 text-muted-foreground bg-foreground/10">esc</kbd>
              </div>
              <ul ref={list} id="search-results" role="listbox" className="max-h-[min(22rem,60vh)] overflow-y-auto py-1">
                {results.map((r, i) => (
                  <li key={r.href + r.path.join()} id={`search-result-${i}`} role="option" aria-selected={i === active}>
                    <a
                      href={r.href}
                      target={r.external ? "_blank" : undefined}
                      rel={r.external ? "noopener noreferrer" : undefined}
                      onMouseMove={() => setActive(i)}
                      onClick={close}
                      className={
                        "flex items-center h-8 px-3 text-sm " +
                        (i === active ? "bg-primary/15 text-foreground" : "text-muted-foreground")
                      }
                    >
                      {r.path.map((p, k) => (
                        <React.Fragment key={k}>
                          {k > 0 && <span className="mx-1.5 text-muted-foreground/60">▸</span>}
                          <span className={k === r.path.length - 1 ? "text-foreground truncate" : "shrink-0"}>{p}</span>
                        </React.Fragment>
                      ))}
                    </a>
                  </li>
                ))}
                {!results.length && <li className="h-8 px-3 flex items-center text-sm text-muted-foreground">Nothing found</li>}
              </ul>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
