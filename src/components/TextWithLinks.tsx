import { parseTextLinks, isExternalHref } from '@/lib/textLinks';

/**
 * Renders editor text that may contain `[link text](url)` links (see
 * lib/textLinks.ts). Plain text renders unchanged, so this is safe to wrap
 * around any translated long-text string. External links open in a new tab.
 */
export default function TextWithLinks({ text }: { text: string }) {
  const segments = parseTextLinks(text);
  if (segments.length === 1 && segments[0].type === 'text') return <>{text}</>;

  return (
    <>
      {segments.map((segment, i) =>
        segment.type === 'link' ? (
          <a
            key={i}
            href={segment.href}
            {...(isExternalHref(segment.href)
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
            style={{
              color: 'var(--color-accent-text)',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
            }}
          >
            {segment.text}
          </a>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </>
  );
}
