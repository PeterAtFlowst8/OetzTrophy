import type { PortableTextComponents } from '@portabletext/react';

/**
 * Portable Text serialisers shared by the race/festival/qualification bodies.
 *
 * Tailwind's Preflight resets headings to inherit the body size/weight and
 * strips list markers, so the default tags render as flat body text. These
 * serialisers re-apply the site's typography (display-font headings, an accent
 * blockquote, marked lists) so the formatting a client adds with the Studio
 * toolbar actually shows on the page.
 *
 * Editors also add empty "blank line" paragraphs to space text out; an empty
 * normal block renders as a single line of vertical space (a non-breaking
 * space, hidden from screen readers) rather than collapsing to nothing.
 */
const headingBase = {
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  color: 'var(--color-ink)',
};

export const richTextComponents: PortableTextComponents = {
  marks: {
    // Links inserted via the Studio toolbar: honours the "Open in new tab"
    // option (the default renderer ignores it) and styles them visibly.
    link: ({ children, value }) => (
      <a
        href={value?.href}
        {...(value?.blank ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        style={{
          color: 'var(--color-accent-text)',
          textDecoration: 'underline',
          textUnderlineOffset: '2px',
        }}
      >
        {children}
      </a>
    ),
  },
  block: {
    h2: ({ children }) => (
      <h2
        className="uppercase"
        style={{ ...headingBase, fontSize: 'clamp(26px, 3.5vw, 34px)', lineHeight: 1.05, margin: '2.5rem 0 1rem' }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className="uppercase"
        style={{ ...headingBase, fontSize: 'clamp(21px, 2.8vw, 26px)', lineHeight: 1.1, margin: '2rem 0 0.75rem' }}
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 style={{ ...headingBase, fontSize: 'clamp(18px, 2.2vw, 21px)', lineHeight: 1.2, margin: '1.5rem 0 0.5rem' }}>
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote
        style={{
          borderLeft: '3px solid var(--color-accent)',
          paddingLeft: '1.25rem',
          margin: '1.75rem 0',
          fontStyle: 'italic',
          color: 'var(--color-muted)',
        }}
      >
        {children}
      </blockquote>
    ),
    normal: ({ children, value }) => {
      const isBlank = !value?.children?.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (child: any) => child?._type === 'span' && (child.text ?? '').trim() !== '',
      );

      if (isBlank) {
        return <p aria-hidden="true">{' '}</p>;
      }

      return <p>{children}</p>;
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: '1.25rem 0' }}>{children}</ul>
    ),
    number: ({ children }) => (
      <ol style={{ listStyleType: 'decimal', paddingLeft: '1.5rem', margin: '1.25rem 0' }}>{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li style={{ marginBottom: '0.5rem', lineHeight: 1.7 }}>{children}</li>,
    number: ({ children }) => <li style={{ marginBottom: '0.5rem', lineHeight: 1.7 }}>{children}</li>,
  },
};
