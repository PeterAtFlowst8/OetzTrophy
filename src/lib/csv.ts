/**
 * CSV for German/Austrian Excel (spec §5): UTF-8 BOM so Excel detects the
 * encoding (umlauts), semicolon delimiter (de-AT list separator), CRLF rows,
 * every cell quoted with " doubled.
 */

export type CsvColumn = { key: string; header: string };

function cell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  // Excel evaluates formulas even in quoted CSV cells; registration names are
  // attacker-writable, so neutralize =, +, -, @, tab, CR triggers (OWASP).
  const safe = /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function toCsv(
  rows: ReadonlyArray<Record<string, unknown>>,
  columns: ReadonlyArray<CsvColumn>,
): string {
  const header = columns.map((c) => cell(c.header)).join(';');
  const lines = rows.map((row) => columns.map((c) => cell(row[c.key])).join(';'));
  return '\uFEFF' + [header, ...lines].join('\r\n') + '\r\n'; // explicit BOM escape — never paste the invisible char
}
