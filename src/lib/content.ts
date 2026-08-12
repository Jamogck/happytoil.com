import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * Drafts are visible while running `astro dev` and never in a build.
 */
const showDrafts = import.meta.env.DEV;

function published<T extends { data: { draft: boolean } }>(entries: T[]): T[] {
  return showDrafts ? entries : entries.filter((entry) => !entry.data.draft);
}

export async function getWork(): Promise<CollectionEntry<'work'>[]> {
  const entries = published(await getCollection('work'));
  return entries.sort(
    (a, b) => b.data.year - a.data.year || a.data.order - b.data.order,
  );
}

export async function getWriting(): Promise<CollectionEntry<'writing'>[]> {
  const entries = published(await getCollection('writing'));
  return entries.sort(
    (a, b) => b.data.published.valueOf() - a.data.published.valueOf(),
  );
}

export async function getProducts(): Promise<CollectionEntry<'products'>[]> {
  const entries = published(await getCollection('products'));
  return entries.sort(
    (a, b) => a.data.order - b.data.order || b.data.year - a.data.year,
  );
}

/** The years an engagement covers, e.g. "2023" or "2021–2024". */
export function yearRange(year: number, through?: number): string {
  return through && through !== year ? `${year}–${through}` : String(year);
}

/**
 * A stable, CSS-safe view-transition name pairing a listing thumbnail with its
 * detail-page hero image, so the photograph carries through on navigation.
 * Prefixed by collection so a work entry and a product entry can never collide.
 */
export function thumbTransitionName(kind: 'work' | 'product', id: string): string {
  return `thumb-${kind}-${id.replace(/[^a-zA-Z0-9-]/g, '-')}`;
}
