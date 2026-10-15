// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://happytoil.com',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.startsWith('https://happytoil.com/preview/'),
    }),
  ],
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  markdown: {
    // Sätteri (Astro's native pipeline) handles GFM tables, footnotes,
    // and smart punctuation by default. Nothing to add unless we need a plugin.
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
});
