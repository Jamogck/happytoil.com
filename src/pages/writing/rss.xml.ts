import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getWriting } from '../../lib/content';
import { site } from '../../site';

export async function GET(context: APIContext) {
  const writing = await getWriting();

  return rss({
    title: `${site.name} — Writing`,
    description: 'Essays by Jordan Mogck on vocation, small business, technology, and farming.',
    site: context.site ?? site.url,
    items: writing.map((entry) => ({
      title: entry.data.title,
      description: entry.data.summary,
      pubDate: entry.data.published,
      link: `/writing/${entry.id}/`,
    })),
    customData: '<language>en-us</language>',
  });
}
