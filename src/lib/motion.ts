// Motion, after Blender's viewport. Everything here answers a click and is skipped
// under prefers-reduced-motion.
//
//   rerender()   the page content redraws low-res first and refines (8px, 4px, 2px, sharp),
//                like a viewport render pass, while the header stays sharp the way Blender's
//                header does. Used for shading and theme switches.
//   slide()      a panel's height eases open or shut, like Blender's panel collapse.
//   select()     a crisp 1px selection outline that appears and fades, for where a jump lands.
//
// The #resolve-* filters live in Header.tsx; the rerender keyframes in global.css.

export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const EASE = "cubic-bezier(0.2, 0, 0, 1)";

/** Apply a page-wide change (shading mode, theme), then redraw the content low-res to sharp.
    (A filter on the element itself, not a View Transition: Firefox paints SVG filters on
    view-transition snapshots black.) */
export function rerender(update: () => void) {
  update();
  const content = document.getElementById("page-content");
  if (!content || reducedMotion()) return;
  // Filter only the part of the page on screen; the whole page is ~7000px tall, and
  // filtering all of it costs a 70-150ms frame. (Off-screen content is clipped for 180ms.)
  const r = content.getBoundingClientRect();
  const top = Math.max(0, -r.top);
  const filters = document.querySelectorAll<SVGFilterElement>("filter[id^='resolve-']");
  const region = { x: 0, y: top, width: r.width, height: Math.min(innerHeight, r.height - top) };
  // The grid's seed pixel (feFlood, half a block in) has to sit inside the region too:
  // Chrome clips it to the region before tiling, so a seed left at the top of the page
  // tiles nothing once you've scrolled, and the content draws blank.
  const seed = (f: SVGFilterElement, y: number) => {
    const flood = f.querySelector("feFlood");
    const half = Number(f.id.slice("resolve-".length)) / 2;
    flood?.setAttribute("y", String(y + half));
  };
  filters.forEach((f) => {
    f.setAttribute("filterUnits", "userSpaceOnUse");
    for (const [k, v] of Object.entries(region)) f.setAttribute(k, String(v));
    seed(f, top);
  });
  content.classList.remove("rerendering");
  void content.offsetWidth; // restart the animation on a quick second switch
  content.classList.add("rerendering");
  content.addEventListener(
    "animationend",
    () => {
      content.classList.remove("rerendering");
      // Back to the element's own box, for the live demos' canvas (.rerender-canvas).
      filters.forEach((f) => {
        f.removeAttribute("filterUnits");
        for (const [k, v] of Object.entries({ x: 0, y: 0, width: "100%", height: "100%" })) f.setAttribute(k, String(v));
        seed(f, 0);
      });
    },
    { once: true },
  );
}

const running = new WeakMap<HTMLElement, Animation>();

/** Ease an element's height from `from` to `to` (px), clipping its content meanwhile.
    Resolves true when the slide finished, false when a newer slide on `el` cut it short. */
export function slide(el: HTMLElement, from: number, to: number, ms = 180): Promise<boolean> {
  running.get(el)?.cancel();
  if (reducedMotion() || from === to) return Promise.resolve(true);
  const a = el.animate(
    [
      { height: `${from}px`, overflow: "clip" },
      { height: `${to}px`, overflow: "clip" },
    ],
    { duration: ms, easing: EASE },
  );
  running.set(el, a);
  return a.finished.then(
    () => {
      running.delete(el);
      return true;
    },
    () => false,
  );
}

/** Flash a selection outline round `el`: on at once, then fading, like a viewport selection. */
export function select(el: HTMLElement) {
  if (reducedMotion()) return;
  const css = getComputedStyle(document.documentElement);
  const color = (css.getPropertyValue("--select") || css.getPropertyValue("--primary")).trim();
  // On a framed panel's edge; round anything unframed (open sections, entries) with some air.
  const boxed = el.classList.contains("panel") && !el.classList.contains("panel-open");
  const outlineOffset = boxed ? "-1px" : "6px";
  el.animate(
    [
      { outline: `1px solid ${color}`, outlineOffset },
      { outline: `1px solid ${color}`, outlineOffset, offset: 0.35 },
      { outline: "1px solid transparent", outlineOffset },
    ],
    { duration: 1100, easing: "ease-out" },
  );
}

/** Wire up panel collapse and jump-to-section selection. Called once from Layout.astro. */
export function setupPanels() {
  // Every panel header with the drop-down triangle collapses its panel.
  // Delegated, so it also covers panels rendered by React islands.
  const toggle = (h: HTMLElement) => {
    const panel = h.closest<HTMLElement>(".panel");
    if (!panel) return;
    const from = panel.getBoundingClientRect().height;
    const collapsing = !panel.classList.contains("collapsed");
    panel.classList.toggle("collapsed", collapsing);
    h.setAttribute("aria-expanded", String(!collapsing));
    const to = panel.getBoundingClientRect().height;
    if (collapsing) {
      // Keep the body visible while it slides shut; hide it once the slide ends.
      panel.classList.remove("collapsed");
      slide(panel, from, to).then((finished) => {
        if (finished) panel.classList.add("collapsed");
      });
    } else {
      slide(panel, from, to);
    }
  };
  document.addEventListener("click", (e) => {
    const t = e.target as Element;
    const h = t.closest?.<HTMLElement>(".panel-h");
    if (!h || t.closest("button, a, input, [role=tab]")) return;
    toggle(h);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const h = e.target;
    if (!(h instanceof HTMLElement) || !h.classList.contains("panel-h")) return;
    e.preventDefault();
    toggle(h);
  });

  // After a jump to #section (nav, mobile menu, or arriving with a hash), select where it landed.
  const selectHash = (hash: string) => {
    const el = hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (!el) return;
    const done = () => select(el.classList.contains("panel") ? el : (el.querySelector<HTMLElement>(".panel") ?? el));
    // Wait for the smooth scroll to land (or give up waiting if there was nothing to scroll).
    let fired = false;
    const once = () => {
      if (fired) return;
      fired = true;
      removeEventListener("scrollend", once);
      done();
    };
    addEventListener("scrollend", once);
    setTimeout(once, 900);
  };
  document.addEventListener("click", (e) => {
    const a = (e.target as Element).closest?.<HTMLAnchorElement>("a[href*='#']");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.href, location.href);
    if (url.pathname === location.pathname && url.hash) selectHash(url.hash);
  });
  if (location.hash) addEventListener("load", () => selectHash(location.hash), { once: true });
}
