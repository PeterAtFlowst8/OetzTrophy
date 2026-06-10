'use client';

import type { ComponentType } from 'react';
import type { StringInputProps } from 'sanity';

/**
 * Builds a Studio string/text input that shows the field's built-in fallback
 * copy as a greyed placeholder. This lets editors see the current site text in
 * an otherwise-empty box (blank fields fall back to this copy on the live site).
 *
 * It renders Sanity's own default input and only slips a `placeholder` into the
 * DOM props, so it stays compatible with single-line and multi-line fields and
 * with future Studio updates. It writes nothing on its own — purely a display
 * affordance, so existing content and drafts are never touched.
 */
export function makeFallbackPlaceholderInput(
  placeholder: string,
): ComponentType<StringInputProps> {
  return function FallbackPlaceholderInput(props: StringInputProps) {
    if (!placeholder) return props.renderDefault(props);

    return props.renderDefault({
      ...props,
      elementProps: {
        ...props.elementProps,
        // placeholder is forwarded to the underlying TextInput / TextArea
        placeholder,
      },
    });
  };
}
