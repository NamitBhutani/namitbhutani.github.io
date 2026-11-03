// The home page as a scene tree, for both Outliners: the sidebar one (index.astro) and the
// mobile menu (Header.tsx). Counts are shown like Blender's child counts.
import { publications, news, research, experience, projects } from "./profile";

// An entry's anchor id, from its section and its Outliner label (index.astro puts it on the entry).
export const itemId = (section: string, label: string) =>
  `${section}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

type Row = { id: string; label: string };
const rows = (section: string, labels: string[]): Row[] => labels.map((label) => ({ id: itemId(section, label), label }));

export const homeOutline: { id: string; label: string; count?: number; children?: Row[] }[] = [
  { id: "home", label: "About" },
  { id: "publications", label: "Publications", count: publications.length, children: rows("publications", publications.map((p) => p.short)) },
  { id: "news", label: "News", count: news.length },
  { id: "research", label: "Research", count: research.length, children: rows("research", research.map((r) => r.short)) },
  { id: "experience", label: "Experience", count: experience.length, children: rows("experience", experience.map((e) => e.short)) },
  { id: "projects", label: "Projects", count: projects.length, children: rows("projects", projects.map((p) => p.title)) },
  { id: "contact", label: "Get in touch" },
];

// The other pages, as sibling collections in the mobile menu.
export const pages = [
  { href: "/playground", label: "Playground" },
  { href: "/photoelasticity", label: "Photoelasticity" },
];
