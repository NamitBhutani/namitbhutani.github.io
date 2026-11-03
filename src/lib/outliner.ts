// The Outliners (the home page's sidebar one, and the mobile menu): the section you're
// reading is the selected row, like the active object in Blender's Outliner. In the sidebar
// that section is expanded, and the entry you're reading is selected instead of the section.
// Rows are plain #anchors, so motion.ts's jump selection runs on them too.

const LINE = 1 / 3; // what you're reading: the last thing whose top passed a third of the way down

export function setupOutliner() {
  const sectionIds = [...new Set([...document.querySelectorAll<HTMLElement>("[data-outline]")].map((a) => a.dataset.outline!))];
  const sections = sectionIds.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
  if (!sections.length) return;

  const last = <T extends HTMLElement>(els: T[], line: number) => {
    let hit: T | undefined;
    for (const el of els) if (el.getBoundingClientRect().top <= line) hit = el;
    return hit;
  };

  // A clicked row stays selected until you scroll by hand: near the end of the page the
  // jump can't bring its target up to the reading line.
  let clicked: { section: string; item?: string } | null = null;
  document.addEventListener("click", (e) => {
    const row = (e.target as Element).closest?.<HTMLElement>("[data-outline], [data-outline-item]");
    if (!row) return;
    const section = row.dataset.outline ?? row.closest<HTMLElement>("[data-outline-section]")?.dataset.outlineSection;
    if (section) clicked = { section, item: row.dataset.outlineItem };
    schedule();
  });
  const byHand = () => (clicked = null);
  for (const ev of ["wheel", "touchmove", "keydown"]) addEventListener(ev, byHand, { passive: true });

  let frame = 0;
  let shownSection = "";
  const update = () => {
    frame = 0;
    const line = innerHeight * LINE;
    const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
    const section =
      (clicked && document.getElementById(clicked.section)) ||
      (atBottom ? sections[sections.length - 1] : (last(sections, line) ?? sections[0]));

    // The entry in that section you're reading, if the Outliner lists its entries.
    const itemRows = [...document.querySelectorAll<HTMLElement>(`[data-outline-section="${section.id}"] [data-outline-item]`)];
    const items = itemRows.map((r) => document.getElementById(r.dataset.outlineItem!)).filter((el): el is HTMLElement => el !== null);
    const item = clicked
      ? (clicked.item ? (document.getElementById(clicked.item) ?? undefined) : undefined)
      : atBottom
        ? undefined
        : last(items, line);

    // Applied to every row each time, so rows that mount later (the menu) pick it up.
    for (const row of document.querySelectorAll<HTMLElement>("[data-outline]")) {
      const here = row.dataset.outline === section.id;
      const hasItemSelected = here && item && row.parentElement?.querySelector("[data-outline-item]");
      row.toggleAttribute("data-parent-active", Boolean(hasItemSelected));
      if (here && !hasItemSelected) row.setAttribute("aria-current", "location");
      else row.removeAttribute("aria-current");
    }
    for (const row of document.querySelectorAll<HTMLElement>("[data-outline-item]")) {
      if (item && row.dataset.outlineItem === item.id) row.setAttribute("aria-current", "location");
      else row.removeAttribute("aria-current");
    }
    for (const li of document.querySelectorAll<HTMLElement>("[data-outline-section]")) {
      li.toggleAttribute("data-open", li.dataset.outlineSection === section.id);
    }

    // In a short window the sidebar Outliner scrolls; keep the selected row in its view.
    if (section.id !== shownSection) {
      shownSection = section.id;
      setTimeout(() => {
        const row = document.querySelector<HTMLElement>("nav [aria-current]");
        const nav = row?.closest("nav");
        if (!row || !nav || nav.scrollHeight <= nav.clientHeight) return;
        const r = row.getBoundingClientRect();
        const n = nav.getBoundingClientRect();
        if (r.top < n.top) nav.scrollTop -= n.top - r.top;
        else if (r.bottom > n.bottom) nav.scrollTop += r.bottom - n.bottom;
      }, 200); // after the section's entries have slid open
    }
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  // The mobile menu's rows mount when it opens.
  new MutationObserver(schedule).observe(document.body, { childList: true });
  update();
}
