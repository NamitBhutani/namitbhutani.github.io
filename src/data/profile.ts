// Single source of truth for the homepage and the paper page (the CV is LaTeX, see README).
// Edit here, not in the pages.

export const profile = {
  name: "Namit Bhutani",
  status: "Applying to PhD and MS programmes for Fall 2027",
  email: "namit.bhut@gmail.com",
  website: "https://namitbhutani.github.io",
  github: "https://github.com/NamitBhutani",
  linkedin: "https://linkedin.com/in/namitbhutani",
  // Paste your Google Scholar profile URL here once it exists; the link appears automatically.
  scholar: "https://scholar.google.com/citations?user=CUdqWqMAAAAJ",
  location: "Hyderabad, India",
  // The header's clock: where you are now (Toronto through the DGP internship).
  clock: { city: "Toronto", timeZone: "America/Toronto" },
  interests: [
    "Rendering",
    "Gaussian splatting",
    "Spectral & polarization rendering",
    "GPU performance",
    "Open to most areas of graphics",
  ],
};

export const education = [
  {
    school: "BITS Pilani – Hyderabad Campus",
    url: "https://www.bits-pilani.ac.in/hyderabad/",
    degree: "B.E. (Hons.) Computer Science & M.Sc. (Hons.) Economics (dual degree)",
    period: "Aug 2022 – May 2027 (expected)",
    gpa: "CGPA 8.92 / 10",
  },
];

export const news = [
  {
    date: "Oct 2026",
    html: 'Presented my first-author paper at <b>Pacific Graphics 2026</b> in Singapore (talk and poster); now in the <a href="https://doi.org/10.2312/pg.20261054">Eurographics Digital Library</a>.',
  },
  {
    date: "Oct 2026",
    html: 'Discourse parsing paper published in <b>Artificial Intelligence and Law</b> (Springer).',
  },
  {
    date: "Jun 2026",
    html: 'Joined the <b>Dynamic Graphics Project</b> lab at the University of Toronto.',
  },
  {
    date: "Sep 2025",
    html: 'Completed <b>Google Summer of Code</b> with Blender.',
  },
];

export type Publication = {
  id: string;
  title: string;
  short: string; // the Outliner's row
  authors: string[]; // "Namit Bhutani" is highlighted automatically
  venue: string;
  venueShort: string;
  year: number;
  note?: string;
  image?: string;
  video?: string;
  links: { label: string; href: string }[];
  bibtex?: string;
  summary?: string; // one or two lines for the home page
  longSummary?: string; // the paper page's fuller version (falls back to summary)
};

export const publications: Publication[] = [
  {
    id: "bhutani2026photoelasticity",
    short: "Spectral Photoelasticity",
    title:
      "Real-Time Spectral Photoelasticity via Stochastic Hero-Wavelength Ray Marching and Stress-Aware Temporal Reprojection",
    authors: ["Namit Bhutani", "Tathagata Ray", "Sumanta Pattanaik"],
    venue: "Pacific Graphics 2026 (Conference Papers), The Eurographics Association",
    venueShort: "Pacific Graphics 2026",
    year: 2026,
    note: "Talk + poster",
    image: "/media/pg26-teaser.jpg",
    summary:
      "Physically based photoelastic fringes at 120+ FPS on a laptop GPU: hero-wavelength sampling makes the spectral march 8.55× faster, and a stress-aware history gate removes TAA ghosting as the load changes.",
    longSummary:
      "Physically based photoelastic fringes at over 120 FPS (1080p, laptop RTX 3070): hero-wavelength sampling of the Jones-calculus integral in one packed march (8.55× faster than the 16-wavelength loop), and a stress-aware history gate that removes TAA ghosting when the load changes.",
    links: [
      { label: "Project page", href: "/photoelasticity" },
      { label: "Paper (DOI)", href: "https://doi.org/10.2312/pg.20261054" },
      { label: "Code", href: "https://github.com/NamitBhutani/realtime-photoelasticity-falcor" },
      { label: "Video", href: "/media/pg26-load-demo.mp4" },
    ],
    bibtex: `@inproceedings{bhutani2026photoelasticity,
  title     = {Real-Time Spectral Photoelasticity via Stochastic Hero-Wavelength Ray Marching and Stress-Aware Temporal Reprojection},
  author    = {Bhutani, Namit and Ray, Tathagata and Pattanaik, Sumanta},
  booktitle = {Pacific Graphics 2026 -- Conference Papers},
  publisher = {The Eurographics Association},
  year      = {2026},
  doi       = {10.2312/pg.20261054}
}`,
  },
  {
    id: "cr2026discourse",
    title: "Generative Discourse Parsing for Indian Law",
    short: "Discourse Parsing",
    authors: [
      "Chaitra C R",
      "Namit Bhutani",
      "Sankalp Kulkarni",
      "Sai Rama Akash Varma Sagi",
      "Shashank Pandey",
      "Rohit Yalavarthy",
      "Dipanjan Chakraborty",
      "Prajna Upadhyay",
    ],
    venue: "Artificial Intelligence and Law, Springer",
    venueShort: "AI and Law (Springer)",
    year: 2026,
    image: "/media/legaltree-tree.jpg",
    summary:
      "Parses Indian legal sentences into discourse trees with a fine-tuned T5 and LLM baselines, plus an interactive tree viewer.",
    links: [
      { label: "Paper (Springer)", href: "https://link.springer.com/article/10.1007/s10506-026-09544-3" },
    ],
  },
];

export const research = [
  {
    title: "Structural Editing of Captured Scenes (DGP Lab, University of Toronto)",
    short: "Structural Editing · DGP",
    role: "Research Intern",
    date: "Jun 2026 – Present",
    advisors: "Prof. Karan Singh",
    video: "/media/dgp-structural-editing.mp4",
    poster: "/media/dgp-structural-editing.jpg",
    points: [
      "Building structure models that measure their parameters from a Gaussian-splat capture, so edits repeat captured units instead of stretching them (in progress).",
      "Exploring where a language-model agent can replace user input, in editing and segmentation.",
      "Earlier: a Houdini plugin for brush-based painting over 100K+ splats at 60 FPS with custom-BVH ray picking, and DINOv3-based segmentation queries under 50 ms.",
    ],
  },
  {
    title: "Real-Time Rendering of Polarized Light",
    short: "Polarized Light",
    role: "Undergraduate Researcher",
    date: "Aug 2025 – May 2026",
    advisors: "Prof. Tathagata Ray (BITS Pilani) & Prof. Sumanta Pattanaik (UCF)",
    demo: { scene: "photo" as const, label: "stress fringes in a loaded disk" },
    points: [
      "Real-time spectral photoelasticity in NVIDIA Falcor (first-author paper, Pacific Graphics 2026); now bringing it to VR.",
      "Extended the Enfeldt & Goswami polarization model in Unity shaders to transmission through dielectrics.",
    ],
  },
  {
    title: "LegalTree: Discourse Parsing for Indian Law",
    short: "LegalTree",
    role: "Undergraduate Researcher",
    date: "Aug 2024 – Jul 2026",
    advisors: "Prof. Dipanjan Chakraborty & Prof. Prajna Upadhyay",
    points: [
      "Built the group's demo comparing a fine-tuned T5 parser with GPT-4/4o: discourse trees, triplet extraction and retrieval QA over 1,000+ legal documents.",
      "Built the evaluation for the journal version (AI and Law, 2026) showing linearized trees keep a sentence's full information.",
    ],
  },
];

export const experience = [
  {
    role: "Google Summer of Code Contributor",
    short: "GSoC · Blender",
    company: "Blender Foundation",
    period: "Jun 2025 – Sep 2025",
    description: [
      "Sculpt-mode performance for 1M+ vertex meshes, mentored by Hans Goudey; shipped in Blender 5.0.",
      "Reordered mesh data for cache locality and reused its BVH: entering sculpt mode on a 2.6M-vertex mesh went from 170 ms to 25 ms, and BVH rebuilds got 2.4× faster.",
      "Background ZSTD compression made sculpt undo data at least 2× smaller.",
    ],
    skills: ["C++", "Performance", "Blender internals"],
  },
  {
    role: "Software Engineering Intern",
    short: "SWE Intern · Vidcentum",
    company: "Vidcentum Technologies",
    period: "May 2024 – Jul 2024",
    description: ["Built an async retrieval API for ML applications (<100 ms over 50K+ documents)."],
    skills: [],
  },
];

export const projects = [
  {
    title: "procLand",
    description:
      "GPU terrain generator: Marching Cubes in OpenGL compute shaders, rendering 100K+ polygons.",
    tags: ["C++", "OpenGL", "Compute Shaders", "GLSL"],
    github: "https://github.com/NamitBhutani/procLan",
    demo: { scene: "terrain" as const, label: "ray-marched noise terrain" },
  },
  {
    title: "curvesandSurfacesGL",
    description:
      "Interactive Bézier curve and surface editor that visualises De Casteljau's algorithm.",
    tags: ["C++", "OpenGL", "GLFW", "GLM"],
    github: "https://github.com/NamitBhutani/curvesandSurfacesGL",
  },
  {
    title: "radialGL",
    description:
      "Radial-layout tree visualiser with real-time rerooting and animation.",
    tags: ["C++", "OpenGL", "ImGui", "Algorithms"],
    github: "https://github.com/NamitBhutani/radialgl",
  },
];

export const talks = [
  {
    title: "Real-Time Spectral Photoelasticity",
    venue: "Pacific Graphics 2026, Singapore: talk (Session A10) and poster",
    date: "Oct 2026",
  },
];

export const skills = {
  Languages: "C++, Python, GLSL, Slang, Java, JavaScript, TypeScript",
  Graphics: "NVIDIA Falcor, OpenGL, compute shaders, Unity shaders, Blender internals",
  Tools: "Git, Nix, Docker, Linux",
};
