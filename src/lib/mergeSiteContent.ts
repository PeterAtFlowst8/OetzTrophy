import { KEYS_BY_TYPE } from './pageDocuments';

/**
 * Builds the virtual "site content" document the read layer works with.
 *
 * Starts from the legacy `siteContent` singleton (which also carries the
 * legacy `images.*` uploads) and overlays each page document on top. A page
 * document that EXISTS is authoritative for ALL the keys it owns — including
 * keys it no longer has a value for, so clearing a field in the Studio cannot
 * resurrect the old singleton's value. The singleton only fills in when a
 * page document is missing entirely (i.e. before the one-time migration ran).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = Record<string, any>;

export function mergeSiteContent(
  legacy: Doc | null | undefined,
  pages: readonly Doc[] | null | undefined,
): Doc | null {
  const merged: Doc = legacy && typeof legacy === 'object' ? { ...legacy } : {};

  for (const doc of Array.isArray(pages) ? pages : []) {
    const keys = doc?._type ? KEYS_BY_TYPE[doc._type] : undefined;
    if (!keys) continue;
    for (const key of keys) merged[key] = doc[key];
  }

  return Object.keys(merged).length > 0 ? merged : null;
}
