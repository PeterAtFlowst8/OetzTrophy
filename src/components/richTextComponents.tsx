import type { PortableTextComponents } from '@portabletext/react';

/**
 * Minimal Portable Text serialisers shared by the race/festival page bodies.
 *
 * Editors in Studio add empty "blank line" paragraphs to space their text out.
 * By default an empty block collapses to nothing, so that spacing is lost on the
 * site. Here an empty normal block renders as a single line of vertical space
 * (a non-breaking space, hidden from screen readers), faithfully reflecting what
 * the editor typed. Non-empty paragraphs and every other block type (headings,
 * lists, quotes, links, images) keep their default rendering.
 */
export const richTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children, value }) => {
      const isBlank = !value?.children?.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (child: any) => child?._type === 'span' && (child.text ?? '').trim() !== '',
      );

      if (isBlank) {
        return <p aria-hidden="true">{' '}</p>;
      }

      return <p>{children}</p>;
    },
  },
};
