# Hero media choice + editable accent colour — Design

**Date:** 2026-06-09
**Project:** OETZ TROPHY website (`OetzTrophy/`) — Next.js (App Router) + embedded Sanity Studio
**Status:** Approved, ready for implementation plan

## Goal

Give the client two new self-service controls in the Sanity Studio:

1. **Hero media** — use either a photo (as today) or a video for the homepage hero.
2. **Accent colour** — change the site-wide accent colour (currently amber `#F59E0B`) from the Studio instead of it being hardcoded.

Both must be additive and non-destructive: until the client opts in, the site looks exactly as it does now.

## Current architecture (as-is)

### Hero image flow
- Studio singleton `siteContent` holds `images.hero` (Sanity image, hotspot + co-located `alt`).
- `getSiteImageData('hero', …)` (`src/lib/siteContent.ts`) resolves it to a CDN URL via `urlFor()`.
- `src/app/[locale]/page.tsx` passes `imageSrc` / `imageAlt` to `<Hero>`.
- `src/components/Hero.tsx` renders it with `next/image` (`fill`, `priority`, `object-cover`).
- The same hero image is reused in `src/app/[locale]/layout.tsx` as the OpenGraph / Twitter social-share image (1200×630).

### Accent colour flow
- Three CSS variables in `src/app/globals.css` under Tailwind v4 `@theme inline`:
  - `--color-accent: #F59E0B`
  - `--color-accent-dark: #D97706` (hover)
  - `--color-accent-text: #8A4700` (deep shade for small labels / text)
- **All 22 usages** read these via `var(--color-accent*)` in inline styles / arbitrary Tailwind values. There are **no** generated Tailwind accent utilities (e.g. `bg-accent`) that would inline a static value.
- Consequence: a single runtime `:root { --color-accent…: }` override recolours the whole site with no per-component edits.

## Feature 1 — Hero photo or video

### Studio schema (`src/sanity/schemaTypes/siteContent.ts`, Images section)
Add to the `images` object, near the `hero` field:

- `heroMediaType` — `string`, `options.list` = `[{title:'Photo', value:'image'}, {title:'Video', value:'video'}]`, `layout: 'radio'`, `initialValue: 'image'`. Title e.g. "Homepage hero: photo or video".
- `heroVideo` — `file` field accepting `video/mp4,video/webm` (`options.accept`). `hidden` unless `heroMediaType === 'video'`. Description: keep it short and small (guidance ~5–15 MB), muted/looping with no sound, and that the hero **photo** is shown as the still fallback / poster.
- `heroVideoAutoplay` — `boolean`, `initialValue: true`, `hidden` unless `heroMediaType === 'video'`. Title e.g. "Autoplay the video". Description: when on, the video plays automatically (muted, looping); when off, visitors see the hero photo with a play button and start it themselves.
- The existing `hero` image field stays as-is (Photo option + video poster + social image).

### Data layer (`src/lib/siteContent.ts`)
Add `getHeroMedia()` returning a typed shape, e.g.:

```
{ type: 'image' | 'video', videoUrl: string | null, autoplay: boolean, posterUrl: string, imageUrl: string, alt: string }
```

- Runs a focused GROQ query that dereferences the file asset URL:
  `*[_type == "siteContent"][0]{ images{ heroMediaType, heroVideoAutoplay, hero, "heroVideoUrl": heroVideo.asset->url } }`
- Resolves the poster/photo URL with `urlFor(images.hero)` (existing pattern), reuses the alt-resolution logic already in `getSiteImageData`.
- Wrapped in the same try/catch + React `cache()` fallback discipline as the rest of the file, so a Sanity outage falls back to the static `/images/hero.jpg`.
- `type` collapses to `'image'` when `heroMediaType !== 'video'` **or** no video has been uploaded (defensive).

### Component (`src/components/Hero.tsx`)
- New props: `mediaType: 'image' | 'video'`, `videoSrc?: string | null`, `autoplay?: boolean`, `posterSrc?: string` (keep existing `imageSrc` / `imageAlt`).
- When `mediaType === 'video' && videoSrc`: render a background `<video muted loop playsInline preload="metadata" poster={posterSrc}>` with the same `absolute inset-0 object-cover` treatment as the current `<Image>`.
  - `autoplay === true`: `autoPlay` + `loop`, no controls (current ambient-background behaviour).
  - `autoplay === false`: show the poster with native `controls` and no autoplay — visitor presses play.
- Otherwise: unchanged `<Image>` path.
- Reduced motion: when `autoplay` is on **and** the visitor prefers reduced motion, do not autoplay — fall back to the poster image (or render the video without autoplay). The explicit "Autoplay off" setting always wins toward not autoplaying.
- All overlays, gradients, countdown, badge and title markup are untouched.

### Page (`src/app/[locale]/page.tsx`)
- Replace the `getSiteImageData('hero', …)` call with `getHeroMedia()` and pass the new props to `<Hero>`.
- `layout.tsx` OG image logic is unchanged (still uses the hero **photo**).

## Feature 2 — Editable accent colour

### Plugin
- Add dependency `@sanity/color-input` (version compatible with the installed Sanity v5).
- Register `colorInput()` in `sanity.config.ts` `plugins`.

### Studio schema
- Add an **Appearance** field group to the `siteContent` document (new entry in `FIELD_GROUPS`, placed first).
- New field `accentColor` — `type: 'color'`, `options: { disableAlpha: true }`, `group: 'appearance'`. Description: "Main highlight colour for buttons, badges and accents across the site. Leave blank to keep the default amber." Placed before the Images section in the document `fields` array.
- Blank = no override.

### Shade derivation (`src/lib/theme.ts`, new, unit-tested)
- Pure function `deriveAccentShades(hex: string): { accent: string; accentDark: string; accentText: string }`.
- Parse hex → HSL; derive:
  - `accent` = input
  - `accentDark` = input with lightness scaled toward today's amber→amber-dark relationship (hover shade).
  - `accentText` = a substantially darker shade for small text/labels, mirroring `#F59E0B → #8A4700`.
- Clamp lightness to a safe range; return normalised hex strings.
- Validate input is a `#rrggbb` hex; on invalid input return the default amber triple (caller can also choose to skip injection).
- Unit tests cover: default amber maps near the existing three values, a light colour, a dark colour, and invalid input.

### Injection (`src/app/[locale]/layout.tsx`)
- New `getAccentColor()` helper (in `siteContent.ts` or `theme.ts`) returns the picked hex or `null`.
- When set: derive shades and render a `<style>` element (hex-validated, `dangerouslySetInnerHTML`) containing:
  `:root{--color-accent:…;--color-accent-dark:…;--color-accent-text:…}`
  An injected `:root{}` after the stylesheet overrides the `@theme inline` defaults (same specificity, later in cascade) and flows to all `var(--color-accent*)` consumers.
- When `null`: inject nothing — `globals.css` amber remains.

## Safety / rollout

- Purely additive schema changes; no content migration; nothing the client has entered is affected.
- New fields appear empty with fallbacks, so the live site is visually unchanged until the client picks a video or colour. Safe to ship while the client is editing.
- Only new dependency: `@sanity/color-input`.
- After deploy, let the client know the two new options exist (Appearance colour; hero Photo/Video toggle).

## Verification

- Unit test `deriveAccentShades` (vitest, matching existing `*.test.ts`).
- Type-check / build pass and lint clean.
- Browser-preview verification is **skipped at the client's request** — changes land directly on `main` rather than going through the `preview` branch. (The behaviours below remain the acceptance criteria, just not gated on a manual preview pass.)
  1. Photo hero still renders correctly (no regression).
  2. Selecting Video + uploading a file plays the video with the photo as poster; the autoplay toggle is honoured; reduced-motion does not autoplay.
  3. Changing `accentColor` recolours buttons, badges, CTA hover and accent rules across the site; clearing it returns to amber.

## Out of scope

- Mux / adaptive streaming (chose direct file upload).
- Per-page hero videos (homepage only).
- Editable secondary/background colours (accent only).
