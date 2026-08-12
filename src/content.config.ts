import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Three collections, matching the three kinds of thing on the site.
 * Schemas stay small; anything that isn't used by a template doesn't belong.
 */

const fact = z.object({
  label: z.string(),
  /** Coerced so a bare year in YAML doesn't have to be quoted. */
  value: z.coerce.string(),
});

/** Client engagements, written as stories about consequential problems. */
const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: ({ image }) =>
    z.object({
      /** Name the outcome or the problem, not the deliverable. */
      title: z.string(),
      /** The business, described plainly: "A pasture-based poultry farm." */
      business: z.string(),
      /** One or two sentences for listings. */
      summary: z.string(),
      /** Sort key and the year shown in listings. */
      year: z.number().int(),
      /** Optional end year for engagements that ran across several. */
      through: z.number().int().optional(),
      /** Marginal facts: what I did, over how long, with whom. */
      facts: z.array(fact).default([]),
      image: image().optional(),
      imageAlt: z.string().optional(),
      imageCaption: z.string().optional(),
      /** Square crop for listings. Falls back to `image` when absent. */
      thumb: image().optional(),
      thumbAlt: z.string().optional(),
      /** Show on the home page. */
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      /** Lower numbers sort first within a year. */
      order: z.number().default(0),
    }),
});

/** Essays. A first-class part of the practice, not a blog. */
const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Shown under the title on the essay page and in listings. */
      standfirst: z.string().optional(),
      summary: z.string(),
      published: z.coerce.date(),
      updated: z.coerce.date().optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

/** Products and experiments. Finished things and modest ones, side by side. */
const products = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/products' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** A plain answer to "what is it?" */
      summary: z.string(),
      /** Where it lives, if it's public. */
      url: z.url().optional(),
      /** Honest about the state of things. */
      status: z.enum(['running', 'in progress', 'experiment', 'retired']),
      /** Year it started. */
      year: z.number().int(),
      facts: z.array(fact).default([]),
      image: image().optional(),
      imageAlt: z.string().optional(),
      /** Shown in the products grid. Falls back to `image` when absent. */
      thumb: image().optional(),
      thumbAlt: z.string().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      order: z.number().default(0),
    }),
});

export const collections = { work, writing, products };
