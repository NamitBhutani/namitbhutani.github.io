// Single source of truth for the homepage and the paper page (the CV is LaTeX, see README).
// Edit here, not in the pages.

export const profile = {
  name: "Namit Bhutani",
  status: "Seeking MS/PhD positions for 2027",
  email: "namit.bhut@gmail.com",
  website: "https://namitbhutani.github.io",
  github: "https://github.com/NamitBhutani",
  linkedin: "https://linkedin.com/in/namitbhutani",
  // Paste your Google Scholar profile URL here once it exists; the link appears automatically.
  scholar: "https://scholar.google.com/citations?user=CUdqWqMAAAAJ",
  location: "Hyderabad, India",
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
    html: 'Presented my paper at <b>Pacific Graphics 2026</b> in Singapore (talk in Session A10 and poster). It is now published in the <a href="https://doi.org/10.2312/pg.20261054">Eurographics Digital Library</a>.',
  },
  {
    date: "Oct 2026",
    html: '<i>Generative discourse parsing for Indian law</i> published in <b>Artificial Intelligence and Law</b> (Springer).',
  },
  {
    date: "Aug 2026",
    html: 'First-author paper on <b>real-time spectral photoelasticity</b> accepted at Pacific Graphics 2026.',
  },
  {
    date: "Jun 2026",
    html: 'Joined the <b>Dynamic Graphics Project (DGP)</b> lab at the University of Toronto, working on structure-aware editing of captured 3D scenes.',
  },
  {
    date: "Sep 2025",
    html: 'Completed <b>Google Summer of Code</b> with the Blender Foundation (sculpting performance).',
  },
];

export type Publication = {
  id: string;
  title: string;
  authors: string[]; // "Namit Bhutani" is highlighted automatically
  venue: string;
  venueShort: string;
  year: number;
  note?: string;
  image?: string;
  video?: string;
  links: { label: string; href: string }[];
  bibtex?: string;
  summary?: string;
};

export const publications: Publication[] = [
  {
    id: "bhutani2026photoelasticity",
    title:
      "Real-Time Spectral Photoelasticity via Stochastic Hero-Wavelength Ray Marching and Stress-Aware Temporal Reprojection",
    authors: ["Namit Bhutani", "Tathagata Ray", "Sumanta Pattanaik"],
    venue: "Pacific Graphics 2026 (Conference Papers), The Eurographics Association",
    venueShort: "Pacific Graphics 2026",
    year: 2026,
    note: "Talk + poster",
    image: "/media/pg26-teaser.jpg",
    summary:
      "Physically based photoelastic fringes at over 120 FPS (1080p, laptop RTX 3070): hero-wavelength sampling of the Jones-calculus integral in one packed march (8.55× faster than the 16-wavelength loop), and a stress-aware history gate that removes TAA ghosting when the load changes.",
    links: [
      { label: "Project page", href: "/photoelasticity" },
      { label: "Paper (DOI)", href: "https://doi.org/10.2312/pg.20261054" },
      { label: "Paper (PDF)", href: "/papers/bhutani2026photoelasticity.pdf" },
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
      "Turns sentences from Indian legal text into discourse trees (relations such as elaboration, condition and contrast) with fine-tuned T5 and LLM baselines, plus an interactive tool that draws the tree for any sentence.",
    links: [
      { label: "Paper (Springer)", href: "https://link.springer.com/article/10.1007/s10506-026-09544-3" },
    ],
  },
];

export const research = [
  {
    title: "Structure-Aware Editing of Captured Scenes (DGP Lab, University of Toronto)",
    role: "Research Intern",
    date: "Jun 2026 – Present",
    advisors: "Prof. Karan Singh",
    points: [
      "Editing Gaussian-splat captures so that an edit respects how the scene is built, instead of stretching or tearing it (in progress).",
      "Started from a Houdini plugin for brush-based splat painting and selection over 100K+ splats at 60 FPS (RTX 3070), with C++ ray picking through a custom BVH.",
      "Distilled multi-view DINOv3 features into per-splat embeddings; unsupervised segmentation with similarity queries under 50 ms.",
    ],
  },
  {
    title: "Real-Time Rendering of Polarized Light",
    role: "Undergraduate Researcher",
    date: "Aug 2025 – Present",
    advisors: "Prof. Tathagata Ray (BITS Pilani) & Prof. Sumanta Pattanaik (UCF)",
    points: [
      "Real-time spectral photoelasticity renderer in NVIDIA Falcor; first-author paper at Pacific Graphics 2026.",
      "Developing a real-time photoelasticity pipeline for VR.",
      "Implemented the Enfeldt & Goswami polarization model in Unity shaders and extended it to transmission through dielectrics.",
    ],
  },
  {
    title: "LegalTree: Discourse Parsing for Indian Law",
    role: "Undergraduate Researcher",
    date: "Sep 2024 – Dec 2025",
    points: [
      "Discourse relation extraction for Indian legal text; published in Artificial Intelligence and Law (2026).",
      "Built a RAG pipeline over 10,000+ legal documents.",
    ],
  },
];

export const experience = [
  {
    role: "Google Summer of Code Contributor",
    company: "Blender Foundation",
    period: "Jun 2025 – Sep 2025",
    description: [
      "Optimized Blender's sculpting performance for meshes with over 1M vertices.",
      "Implemented spatial mesh reordering, improving cache coherency by 35%.",
      "Reduced undo memory overhead by 60% using zstd compression.",
    ],
    skills: ["C++", "Performance", "Blender internals"],
  },
  {
    role: "Software Engineering Intern",
    company: "Vidcentum Technologies",
    period: "May 2024 – Jul 2024",
    description: ["Built an async retrieval API for ML applications (<100 ms on 50K+ documents)."],
    skills: [],
  },
];

export const projects = [
  {
    title: "procLand",
    description:
      "GPU-accelerated 3D terrain generator using OpenGL compute shaders. Marching Cubes on the GPU with an optimized SSBO pipeline, rendering 100K+ polygons.",
    tags: ["C++", "OpenGL", "Compute Shaders", "GLSL"],
    github: "https://github.com/NamitBhutani/procLan",
  },
  {
    title: "radialGL",
    description:
      "Interactive 2D tree visualization engine implementing the radial layout algorithm, with real-time rerooting and smooth animations.",
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
