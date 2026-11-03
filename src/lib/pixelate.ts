// Frosted surfaces (.pixelate) pixelate what's behind them instead of blurring it.
//
// Chromium: `backdrop-filter: url(#pixelate)` does it directly (global.css).
// Firefox:  backdrop-filter ignores SVG filters, but it has -moz-element(), a live image of
//           another element. Each .pixelate gets two layers under its content: that image of
//           what sits behind it, run through the same SVG filter, then its own tint on top.
// Others:   the Tailwind blur stays.
//
// What sits behind: the element named by data-pixelate-src, else every [data-pixelate-layer]
// on the page, else #page-content (each page's content, minus the header). Each source is its
// own -moz-element image placed where that element really is: Firefox draws a sticky element
// at a stale spot inside a copy of its parent (the home page's sidebar photo showed up in the
// header), so a page with a sticky column lists its columns as separate layers.

export function setupPixelate(): () => void {
  const root = document.documentElement;
  if ("userAgentData" in navigator) {
    root.dataset.pixelate = "backdrop";
    return () => {};
  }
  if (!CSS.supports("background-image", "-moz-element(#a)")) return () => {};
  root.dataset.pixelate = "moz";

  const sourcesFor = (el: HTMLElement): HTMLElement[] => {
    if (el.dataset.pixelateSrc) return [document.getElementById(el.dataset.pixelateSrc)].filter((s) => s !== null);
    const layers = [...document.querySelectorAll<HTMLElement>("[data-pixelate-layer]")];
    if (layers.length) return layers;
    return [document.getElementById("page-content")].filter((s) => s !== null);
  };

  let frame = 0;
  const update = () => {
    frame = 0;
    for (const el of document.querySelectorAll<HTMLElement>(".pixelate")) {
      const sources = sourcesFor(el);
      if (!sources.length) continue;
      let image = el.querySelector<HTMLDivElement>(":scope > .pixelate-image");
      if (!image) {
        if (getComputedStyle(el).position === "static") el.style.position = "relative";
        image = document.createElement("div");
        image.className = "pixelate-image";
        image.ariaHidden = "true";
        const tint = document.createElement("div");
        tint.className = "pixelate-tint";
        tint.ariaHidden = "true";
        el.prepend(image, tint);
      }
      // Line each source's image up with where that source really is on screen,
      // over the page background.
      const e = el.getBoundingClientRect();
      const rects = sources.map((s) => s.getBoundingClientRect());
      image.style.backgroundImage = [
        ...sources.map((s) => `-moz-element(#${s.id})`),
        "linear-gradient(var(--background), var(--background))",
      ].join(", ");
      image.style.backgroundSize = [...rects.map((t) => `${t.width}px ${t.height}px`), "100% 100%"].join(", ");
      image.style.backgroundPosition = [...rects.map((t) => `${t.left - e.left}px ${t.top - e.top}px`), "0 0"].join(", ");
    }
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  // New .pixelate elements (the menu overlay, the splats toolbars) mount after load, and
  // layout moves without scrolling (a demo or panel sliding open shifts what's below it).
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true });
  const resizes = new ResizeObserver(schedule);
  for (const s of document.querySelectorAll<HTMLElement>("[data-pixelate-layer], #page-content")) resizes.observe(s);
  addEventListener("scroll", schedule, { passive: true, capture: true });
  addEventListener("resize", schedule);
  update();

  return () => {
    observer.disconnect();
    resizes.disconnect();
    removeEventListener("scroll", schedule, { capture: true });
    removeEventListener("resize", schedule);
    cancelAnimationFrame(frame);
  };
}
