import { describe, expect, it } from 'vitest';
import { pageContentTypes } from './pageContent';

/**
 * The Qualification page should carry the same editable race-fact fields as the
 * race pages (date / format / entry type / rules) so the client can fill the
 * stat block and rules in Studio.
 */
describe('pageQualification schema', () => {
  it('exposes the race-fact fields like the race pages', () => {
    const qual = pageContentTypes.find((t) => t.name === 'pageQualification');
    expect(qual).toBeDefined();
    const names = (qual!.fields as Array<{ name: string }>).map((f) => f.name);
    for (const field of ['title', 'body', 'date', 'format', 'entryType', 'rules']) {
      expect(names, `expected pageQualification to expose "${field}"`).toContain(field);
    }
  });
});
