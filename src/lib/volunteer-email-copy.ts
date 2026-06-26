import enMessages from '../../messages/en.json';
import deMessages from '../../messages/de.json';
import { getMessageOverrides } from './siteContent';
import type { VolunteerEmailCopy } from './volunteer-email';

const baseEn = (enMessages as Record<string, Record<string, string>>).volunteerEmail ?? {};
const baseDe = (deMessages as Record<string, Record<string, string>>).volunteerEmail ?? {};

/**
 * Resolve the volunteer confirmation email copy in BOTH languages: built-in
 * defaults from the messages JSON, overlaid with non-empty Sanity overrides.
 *
 * Needed because the email sends DE + EN together, so the per-locale
 * `getMessageOverrides()` isn't enough on its own. Falls back to the JSON
 * defaults if Sanity is empty or unreachable (getMessageOverrides catches).
 */
export async function getVolunteerEmailCopy(): Promise<VolunteerEmailCopy> {
  const [ovDe, ovEn] = await Promise.all([getMessageOverrides('de'), getMessageOverrides('en')]);
  const de = ovDe.volunteerEmail ?? {};
  const en = ovEn.volunteerEmail ?? {};
  const pick = (key: string) => ({
    de: de[key] ?? baseDe[key] ?? baseEn[key] ?? '',
    en: en[key] ?? baseEn[key] ?? '',
  });
  return { subject: pick('subject'), body: pick('body') };
}
