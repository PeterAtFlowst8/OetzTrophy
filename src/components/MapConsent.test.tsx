import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MapConsent from './MapConsent';

/**
 * GDPR: the Google Maps embed must NOT load (no iframe, no request to Google)
 * until the visitor explicitly clicks to load it. The initial render is a
 * placeholder with a notice + button; the iframe only appears after consent.
 */
describe('MapConsent', () => {
  it('renders the notice and load button but NO Google iframe before consent', () => {
    const html = renderToString(
      <MapConsent
        src="https://www.google.com/maps/d/embed?mid=test"
        title="Lageplan"
        notice="This map is loaded from Google Maps."
        loadLabel="Load map"
      />,
    );
    expect(html).not.toContain('<iframe');
    expect(html).not.toContain('google.com');
    expect(html).toContain('This map is loaded from Google Maps.');
    expect(html).toContain('Load map');
  });
});
