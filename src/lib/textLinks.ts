/**
 * Lightweight link syntax for the plain-text Studio fields: editors write
 * `[link text](https://example.com)` inside any long text field and the
 * frontend renders it as a real link (see <TextWithLinks/>).
 *
 * Only safe destinations are recognised: http(s), mailto:, tel:, and
 * site-internal paths starting with "/". Anything else stays literal text.
 */

export type TextSegment =
  | { type: 'text'; text: string }
  | { type: 'link'; text: string; href: string };

const LINK_RE =
  /\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:|tel:)[^\s)]+|\/[^\s)]*)\)/g;

export function parseTextLinks(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK_RE)) {
    const index = match.index ?? 0;
    if (index > last) segments.push({ type: 'text', text: text.slice(last, index) });
    segments.push({ type: 'link', text: match[1], href: match[2] });
    last = index + match[0].length;
  }
  if (last < text.length) segments.push({ type: 'text', text: text.slice(last) });
  return segments.length > 0 ? segments : [{ type: 'text', text }];
}

/** External http(s) links open in a new tab; internal/mailto/tel don't. */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href);
}
