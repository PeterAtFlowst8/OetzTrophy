import { describe, expect, it } from 'vitest';
import { toCsv } from '@/lib/csv';

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
] as const;

describe('toCsv (German-Excel dialect)', () => {
  it('starts with a UTF-8 BOM and uses semicolons + CRLF', () => {
    const csv = toCsv([{ id: 1, name: 'Anna' }], columns);
    expect(csv.charCodeAt(0)).toBe(0xfeff); // explicit code point — the BOM is invisible in editors
    expect(csv).toContain('"ID";"Name"');
    expect(csv).toContain('\r\n');
  });

  it('preserves umlauts and escapes quotes/semicolons', () => {
    const csv = toCsv([{ id: 2, name: 'Jörg "Blade"; Müller' }], columns);
    expect(csv).toContain('"Jörg ""Blade""; Müller"');
  });

  it('renders null/undefined as empty cells', () => {
    const csv = toCsv([{ id: 3, name: null }], columns);
    expect(csv.trim().endsWith('"3";""')).toBe(true);
  });

  it('neutralizes Excel formula triggers (CSV injection)', () => {
    const csv = toCsv([{ id: 4, name: '=HYPERLINK("http://evil.tld";"click")' }], columns);
    expect(csv).toContain('"\'=HYPERLINK');
    const plus = toCsv([{ id: 5, name: '+491701234567' }], columns);
    expect(plus).toContain('"\'+491701234567"');
  });
});
