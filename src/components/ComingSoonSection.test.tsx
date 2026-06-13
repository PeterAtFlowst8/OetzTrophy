import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ComingSoonSection from './ComingSoonSection';

/**
 * The Results and Gallery pages share this centred "coming soon" section. The
 * body is editable copy, so a Studio link written as `[text](url)` must render
 * as a real anchor — that's the behaviour these tests pin.
 */
describe('ComingSoonSection', () => {
  it('renders the eyebrow and body text', () => {
    const html = renderToString(
      <ComingSoonSection eyebrow="Coming soon" body="Results will appear here." />,
    );
    expect(html).toContain('Coming soon');
    expect(html).toContain('Results will appear here.');
  });

  it('renders a markdown link in the body as a new-tab external anchor', () => {
    const html = renderToString(
      <ComingSoonSection eyebrow="x" body="Follow us on [Instagram](https://instagram.com/oetz)." />,
    );
    expect(html).toContain('href="https://instagram.com/oetz"');
    expect(html).toContain('target="_blank"');
    // The literal markdown must be gone once rendered.
    expect(html).not.toContain('[Instagram]');
  });

  it('renders plain body copy with no anchor', () => {
    const html = renderToString(
      <ComingSoonSection eyebrow="x" body="Nothing to link here yet." />,
    );
    expect(html).not.toContain('<a ');
  });
});
