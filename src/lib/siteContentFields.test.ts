import { describe, expect, it } from 'vitest';
import en from '../../messages/en.json';
import de from '../../messages/de.json';
import { EDITABLE_SITE_CONTENT_KEYS } from './siteContentFields';

const enM = en as Record<string, Record<string, unknown>>;
const deM = de as Record<string, Record<string, unknown>>;

/**
 * Every key declared editable in Studio must be backed by a string in BOTH
 * locale files — otherwise the schema generator silently skips the field (so
 * the client never sees it) or the page falls back to a missing translation.
 * This is the guard for the "all text in Studio" sweep.
 */
describe('EDITABLE_SITE_CONTENT_KEYS are backed by messages', () => {
  it('every editable key exists as a string in both en and de', () => {
    const missing: string[] = [];
    for (const [ns, keys] of Object.entries(EDITABLE_SITE_CONTENT_KEYS)) {
      for (const key of keys) {
        if (typeof enM[ns]?.[key] !== 'string') missing.push(`en.${ns}.${key}`);
        if (typeof deM[ns]?.[key] !== 'string') missing.push(`de.${ns}.${key}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
