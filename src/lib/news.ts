import { sanityClient } from './sanity';

export type SanityPost = {
  _id: string;
  title: { de: string; en: string };
  slug: { de: { current: string }; en: { current: string } };
  excerpt: { de: string; en: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: { de: any[]; en: any[] };
  publishedAt: string;
  categories: string[];
};

const postsQuery = `*[_type == "post"] | order(publishedAt desc) {
  _id, title, slug, excerpt, body, publishedAt, categories
}`;

const postBySlugQuery = `*[_type == "post" && (slug.de.current == $slug || slug.en.current == $slug)][0] {
  _id, title, slug, excerpt, body, publishedAt, categories
}`;

export async function getAllPosts(): Promise<SanityPost[]> {
  return sanityClient.fetch(postsQuery);
}

export async function getPostBySlug(slug: string): Promise<SanityPost | null> {
  return sanityClient.fetch(postBySlugQuery, { slug });
}

export async function getLatestPosts(count = 3): Promise<SanityPost[]> {
  const posts = await getAllPosts();
  return posts.slice(0, count);
}

/** Format a Sanity date for display */
export function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === 'de' ? 'de-AT' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Get the localized title */
export function localizedTitle(post: SanityPost, locale: string): string {
  return locale === 'en' ? (post.title.en || post.title.de) : post.title.de;
}

/** Get the localized slug */
export function localizedSlug(post: SanityPost, locale: string): string {
  if (locale === 'en' && post.slug.en?.current) return post.slug.en.current;
  return post.slug.de.current;
}

/** Get the localized excerpt */
export function localizedExcerpt(post: SanityPost, locale: string): string {
  return locale === 'en' ? (post.excerpt.en || post.excerpt.de) : post.excerpt.de;
}

/** Get the localized body */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function localizedBody(post: SanityPost, locale: string): any[] {
  return locale === 'en' ? (post.body.en || post.body.de) : post.body.de;
}
