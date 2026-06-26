import { describe, expect, it } from 'vitest';
import { signActionToken, verifyActionToken } from './registration-links';

const SECRET = 'test-action-secret-0123456789';

describe('registration-links action tokens', () => {
  it('round-trips a signed (id, email) payload', () => {
    const token = signActionToken(42, 'ada@example.com', SECRET);
    expect(verifyActionToken(token, SECRET)).toEqual({ id: 42, email: 'ada@example.com' });
  });

  it('rejects a tampered token', () => {
    const token = signActionToken(42, 'ada@example.com', SECRET);
    // Flip a character in the body segment (before the '.') to break the HMAC.
    const [body, sig] = token.split('.');
    const flipped = (body[0] === 'A' ? 'B' : 'A') + body.slice(1);
    expect(verifyActionToken(`${flipped}.${sig}`, SECRET)).toBeNull();
  });

  it('rejects a token signed with a different secret', () => {
    const token = signActionToken(42, 'ada@example.com', SECRET);
    expect(verifyActionToken(token, 'a-different-secret')).toBeNull();
  });

  it('rejects malformed tokens', () => {
    for (const bad of ['', 'garbage', 'a.b.c', 'noDotHere', '.', 'only.']) {
      expect(verifyActionToken(bad, SECRET)).toBeNull();
    }
  });

  it('fails closed when the secret is missing', () => {
    const token = signActionToken(42, 'ada@example.com', SECRET);
    expect(verifyActionToken(token, undefined)).toBeNull();
    expect(() => signActionToken(42, 'ada@example.com', undefined)).toThrow();
  });
});
