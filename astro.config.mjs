// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  // The CV is a LaTeX PDF (source: ~/life-sort/practice-school/cv_academic.tex).
  redirects: {
    '/cv': '/Namit_Bhutani_CV.pdf',
  },

  vite: {
    plugins: [tailwindcss()]
  }
});