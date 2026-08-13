/**
 * One place for the handful of facts the site repeats.
 * Edit here rather than hunting through templates.
 */

export const site = {
  name: 'Happy Toil',
  person: 'Jordan Mogck',
  url: 'https://happytoil.com',
  email: 'jordan@happytoil.com',
  /** Used in <meta name="description"> when a page supplies none. */
  description:
    'Happy Toil is the practice of Jordan Mogck — strategy, software, and sustained attention for owner-led businesses doing real work.',
} as const;

export const nav = [
  { href: '/work/', label: 'Work' },
  { href: '/writing/', label: 'Writing' },
  { href: '/products/', label: 'Products' },
  { href: '/about/', label: 'About' },
] as const;

/** Formats a date the way the site prefers: quiet, unambiguous, no cleverness. */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Just the year and month — for archive listings. */
export function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(date);
}

/** Zero-padded index for editorial numbering. */
export function ordinal(n: number): string {
  return String(n).padStart(2, '0');
}
