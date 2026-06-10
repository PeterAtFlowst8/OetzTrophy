import { describe, it, expect } from 'vitest';
import { fileUrlFromRef } from './siteContent';

describe('fileUrlFromRef', () => {
  it('builds the CDN URL from a file asset ref', () => {
    expect(fileUrlFromRef('file-abc123DEF-mp4')).toBe(
      'https://cdn.sanity.io/files/mnazp3qy/production/abc123DEF.mp4',
    );
  });

  it('returns null for malformed refs', () => {
    expect(fileUrlFromRef('image-abc123-2048x1365-webp')).toBeNull();
    expect(fileUrlFromRef('not-a-ref')).toBeNull();
    expect(fileUrlFromRef('')).toBeNull();
  });
});
