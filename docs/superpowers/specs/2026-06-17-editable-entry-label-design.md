# Editable "Entry / Participation" label — design

**Date:** 2026-06-17
**Status:** Approved (design)

## Context

The race and qualification pages show a small facts grid (Date / Format / Entry).
The **Entry** stat ("Teilnahme" / "Entry") is currently produced from a fixed
Sanity dropdown field `entryType` (`qualification` | `open` | `free`), whose
display text is hardcoded in `entryTypeLabel()` ([src/lib/events.ts](../../../src/lib/events.ts)).

The client wants this stat to read **"Anmeldung" (DE) / "Registration" (EN)** on
the Qualification page. Two problems with the status quo:

1. The dropdown can't produce that wording — its closest option (`open`) maps to
   "Rennwochenende-Anmeldung / Race weekend registration", and the labels aren't
   editable in Studio.
2. It violates the standing rule that all visible text should be Studio-editable
   in both languages.

`entryType` drives **no logic** — it is read in exactly three places (the OETZ
TROPHY, Kayak Cross, and Qualification page renders), all only to render the
stat's value. So changing how the label is produced is safe.

## Goal

Let the client set the Entry stat as free DE/EN text on the OETZ TROPHY, Kayak
Cross, and Qualification pages (the three pages that show it). Free text wins;
when blank, fall back to today's dropdown label so nothing changes until they
choose to edit it.

## Decision

**Additive override (chosen over replacing the dropdown).** Add a new free-text
field and prefer it; keep `entryType` as the fallback default. This is
non-destructive: every page keeps its current label with zero data migration —
which matters because live Sanity-dataset writes are currently constrained.
Replacing the dropdown outright was rejected: it would blank the three pages
until re-typed and make Sanity flag the old string values as invalid.

## Design

### 1. Sanity schema — `src/sanity/schemaTypes/pageContent.ts`

In `raceContentFields()`, add a `localizedString` field **`entryLabel`**
immediately **above** the `entryType` dropdown:

- Title: `Entry / Participation label`
- Both languages optional (`{ optional: true }`)
- Description: *"Shown in the event facts, e.g. Anmeldung / Registration. Leave
  blank to use the standard label from the dropdown below."*

Update the existing `entryType` field's description to read as the fallback:
*"Standard label, used only when the 'Entry / Participation label' text field
above is left empty."*

### 2. Read layer

- **`src/lib/pageText.ts`** — add `entryLabel?: { de?: string; en?: string }` to
  the `PageText` type and add `entryLabel` to the GROQ projection in `QUERY`.
- **`src/lib/events.ts`** — add `entryLabel?: { de?: string; en?: string }` to
  the `SanityEvent` type and add `entryLabel` to the `RACE_FIELDS` projection.

`queries.ts` is **not** touched: its `eventsQuery` is unused dead code, and the
legacy `event` documents (queried as a fallback in `raceContentQuery`) simply
won't carry `entryLabel` — the helper's fallback covers them.

### 3. Shared helper — `src/lib/events.ts`

The only behaviour change. One function owns the override-then-fallback rule so
it can't drift across the three page renders:

```ts
export function entryFactValue(
  entryLabel: { de?: string; en?: string } | null | undefined,
  entryType: string | null | undefined,
  locale: string,
): string {
  const custom =
    locale === 'en'
      ? entryLabel?.en || entryLabel?.de
      : entryLabel?.de || entryLabel?.en;
  if (custom?.trim()) return custom.trim();
  return entryType ? entryTypeLabel(entryType, locale) : '';
}
```

Cross-language fill mirrors the existing `localizedFormat` behaviour (a DE-only
value shows in both languages).

### 4. Page renders

Each page passes its own source object's `entryLabel` + `entryType` into the
helper, then renders the fact only when the result is non-empty. On the
Qualification page (source: `text` from `getPageText`):

```ts
const entry = entryFactValue(text?.entryLabel, text?.entryType, locale);
// ...in the facts array:
entry ? { label: locale === 'de' ? 'Teilnahme' : 'Entry', value: entry } : null
```

- `src/app/[locale]/qualification/page.tsx` — source `text`: `entryFactValue(text?.entryLabel, text?.entryType, locale)`.
- `src/app/[locale]/oetz-trophy/page.tsx` — source `event`: `entryFactValue(event.entryLabel, event.entryType, locale)`.
- `src/app/[locale]/kayak-cross/page.tsx` — source `event`: `entryFactValue(event.entryLabel, event.entryType, locale)`.

(A page has either `text` or `event`, never both — each render uses its own.)

The stat shows when the helper returns a non-empty string (i.e. either the free
text or the dropdown is set), matching today's "show only if filled" behaviour.

### 5. Tests (TDD)

Unit-test `entryFactValue` in `src/lib/events.test.ts`:

- free text present → returns the free text (per locale)
- free text blank/absent → returns the `entryTypeLabel` for `entryType`
- both blank → returns `''` (stat hidden)
- DE-only free text, EN locale → returns the DE text (cross-language fill)

Extend `src/sanity/schemaTypes/pageContent.test.ts` to assert `entryLabel` is
among the generated race-content fields.

## Non-goals

- No change to the registration flow (independent of today's 18:00 launch).
- No data migration; no removal of the `entryType` dropdown.
- No new dropdown options or changes to `entryTypeLabel`'s hardcoded map (it
  stays as the fallback source).

## Verification

`npx tsc --noEmit` · `npm test` · `npm run build`. Optionally confirm on the
preview deploy that the Qualification page reads the client's free text once
entered.

## Files touched

- `src/sanity/schemaTypes/pageContent.ts` (field + description)
- `src/lib/pageText.ts` (type + query)
- `src/lib/events.ts` (type + RACE_FIELDS + `entryFactValue`)
- `src/app/[locale]/qualification/page.tsx`
- `src/app/[locale]/oetz-trophy/page.tsx`
- `src/app/[locale]/kayak-cross/page.tsx`
- `src/lib/events.test.ts`, `src/sanity/schemaTypes/pageContent.test.ts`
