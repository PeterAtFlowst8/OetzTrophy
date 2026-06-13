import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import TextWithLinks from './TextWithLinks';

/**
 * Contract for the shared link renderer used across every editable body field.
 * The whole "links work in any prose field" sweep relies on these guarantees,
 * so they are pinned directly on the component (not just the parser in
 * lib/textLinks.test.ts).
 */
describe('TextWithLinks', () => {
  it('renders plain text without an anchor', () => {
    expect(renderToString(<TextWithLinks text="Just some words." />)).not.toContain('<a ');
  });

  it('renders an external link as a new-tab anchor', () => {
    const html = renderToString(<TextWithLinks text="see [site](https://example.com)" />);
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('renders an internal path link without opening a new tab', () => {
    const html = renderToString(<TextWithLinks text="go to [the programme](/de/programm)" />);
    expect(html).toContain('href="/de/programm"');
    expect(html).not.toContain('target="_blank"');
  });

  it('renders a mailto link without opening a new tab', () => {
    const html = renderToString(<TextWithLinks text="email [us](mailto:info@oetz-trophy.com)" />);
    expect(html).toContain('href="mailto:info@oetz-trophy.com"');
    expect(html).not.toContain('target="_blank"');
  });

  it('leaves an unsupported scheme as literal text (no anchor)', () => {
    const html = renderToString(<TextWithLinks text="danger [x](javascript:alert(1))" />);
    expect(html).not.toContain('<a ');
    expect(html).toContain('[x]');
  });

  it('renders multiple links in one string', () => {
    const html = renderToString(
      <TextWithLinks text="[a](https://a.com) and [b](https://b.com)" />,
    );
    expect(html).toContain('href="https://a.com"');
    expect(html).toContain('href="https://b.com"');
  });
});
