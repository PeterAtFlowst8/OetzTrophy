/**
 * Minimal bilingual HTML page for the self-service resume/cancel routes (invalid
 * link, not found, already paid, deregistered). Pure string builder — kept free
 * of next/server so it's trivially testable and reusable. Mirrors the email shell.
 */
export function renderActionPage(input: { heading: string; de: string[]; en: string[] }): string {
  const block = (lines: string[]) =>
    lines.map((l) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;">${l}</p>`).join('');
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${input.heading} — OETZ TROPHY</title></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c1917;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:#1c1917;color:#ffffff;padding:18px 24px;font-size:20px;font-weight:700;letter-spacing:0.06em;">OETZ TROPHY</div>
    <div style="background:#ffffff;border:1px solid #e7e5e4;border-top:4px solid #f59e0b;padding:24px;">
      ${block(input.de)}
      <hr style="border:none;border-top:1px solid #e7e5e4;margin:20px 0;"/>
      ${block(input.en)}
    </div>
    <p style="font-size:12px;color:#78716c;padding:14px 4px;margin:0;">OETZ TROPHY · Source To Sea GmbH · Natterer See 1, 6161 Natters, Austria</p>
  </div>
</body>
</html>`;
}
