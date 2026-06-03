import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import { getMessageOverrides } from '@/lib/siteContent';

type Messages = Record<string, Record<string, string>>;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Static JSON messages act as the baseline / fallback.
  const base = (await import(`../../messages/${locale}.json`))
    .default as Messages;

  // Client-managed overrides from Sanity (empty values are skipped upstream).
  const overrides = await getMessageOverrides(locale);

  const messages: Messages = { ...base };
  for (const namespace of Object.keys(overrides)) {
    messages[namespace] = { ...(base[namespace] ?? {}), ...overrides[namespace] };
  }

  return { locale, messages };
});
