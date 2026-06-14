import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PortableText } from '@portabletext/react';
import { richTextComponents } from './richTextComponents';

/**
 * The race/festival/qualification bodies render Portable Text through these
 * shared serializers. Tailwind's Preflight flattens the default heading/list
 * tags, so the serializers must apply their own visible styling — otherwise a
 * client's H2 renders at body size and lists lose their bullets.
 */
function span(key: string, text: string) {
  return { _type: 'span', _key: key, text, marks: [] };
}
const doc = [
  { _type: 'block', _key: 'a', style: 'h2', markDefs: [], children: [span('a1', 'Section Heading')] },
  { _type: 'block', _key: 'b', style: 'h3', markDefs: [], children: [span('b1', 'Sub Heading')] },
  { _type: 'block', _key: 'c', style: 'normal', markDefs: [], children: [span('c1', 'A normal paragraph.')] },
  { _type: 'block', _key: 'd', style: 'blockquote', markDefs: [], children: [span('d1', 'A quotation.')] },
  { _type: 'block', _key: 'e', style: 'normal', listItem: 'bullet', level: 1, markDefs: [], children: [span('e1', 'First bullet')] },
  { _type: 'block', _key: 'f', style: 'normal', listItem: 'number', level: 1, markDefs: [], children: [span('f1', 'First step')] },
];
const render = () => renderToString(<PortableText value={doc as never} components={richTextComponents} />);

describe('richTextComponents block + list styling', () => {
  it('renders an H2 with bold display-font heading styling (not flat body text)', () => {
    const html = render();
    expect(html).toMatch(/<h2[^>]*style="[^"]*font-weight:\s*700/);
    expect(html).toContain('Section Heading');
  });

  it('renders an H3 with heading styling', () => {
    expect(render()).toMatch(/<h3[^>]*style="[^"]*font-weight:\s*700/);
  });

  it('renders a blockquote with an accent border', () => {
    expect(render()).toMatch(/<blockquote[^>]*style="[^"]*border/);
  });

  it('renders bulleted lists with disc markers and indentation', () => {
    const html = render();
    expect(html).toMatch(/<ul[^>]*style="[^"]*list-style-type:\s*disc/);
    expect(html).toMatch(/<ul[^>]*style="[^"]*padding-left/);
  });

  it('renders numbered lists with decimal markers', () => {
    expect(render()).toMatch(/<ol[^>]*style="[^"]*list-style-type:\s*decimal/);
  });

  it('still renders a plain paragraph for normal text', () => {
    expect(render()).toContain('A normal paragraph.');
  });
});
