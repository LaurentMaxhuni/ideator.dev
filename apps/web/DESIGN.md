---
name: ideator.dev
description: An idea discovery workbench — find an idea, then make it survive reality.
colors:
  harbor-water: "#1d3440"
  harbor-card: "#274855"
  harbor-popover: "#25434f"
  harbor-secondary: "#376375"
  harbor-muted: "#2f5665"
  mooring-light-amber: "#ffd35c"
  ink-teal: "#122630"
  lamplight-cream: "#fff7e7"
  sea-glass-mint: "#bceee4"
  mist-green: "#d3dedc"
  warning-coral: "#f08b80"
  cream-border: "rgb(255 247 231 / 22%)"
  cream-input: "rgb(255 247 231 / 30%)"
typography:
  display:
    fontFamily: "Outfit, 'Segoe UI', system-ui, sans-serif"
    fontWeight: 300
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Outfit, 'Segoe UI', system-ui, sans-serif"
    fontWeight: 500
    letterSpacing: "-0.045em"
  title:
    fontFamily: "Outfit, 'Segoe UI', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
  body:
    fontFamily: "Outfit, 'Segoe UI', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Outfit, 'Segoe UI', system-ui, sans-serif"
    fontSize: "0.68rem"
    fontWeight: 600
    letterSpacing: "0.1em"
    lineHeight: 1.2
  mono:
    fontFamily: "ui-monospace, 'SFMono-Regular', Consolas, monospace"
    fontSize: "0.75rem"
rounded:
  sm: "0.6875rem"
  md: "0.8125rem"
  lg: "1rem"
  xl: "1.25rem"
  2xl: "1.5rem"
  pill: "999px"
spacing:
  gap-tight: "0.75rem"
  gap-card: "1.25rem"
  section-y: "5rem"
  section-y-lg: "7rem"
  container: "72rem"
components:
  button-primary:
    backgroundColor: "{colors.mooring-light-amber}"
    textColor: "{colors.ink-teal}"
    rounded: "{rounded.md}"
    height: "3rem"
    padding: "0.75rem 1.25rem"
  button-primary-hover:
    backgroundColor: "rgb(255 211 92 / 90%)"
  button-secondary:
    backgroundColor: "rgb(255 211 92 / 10%)"
    textColor: "{colors.mooring-light-amber}"
    rounded: "{rounded.md}"
    height: "2.75rem"
    padding: "0.5rem 1rem"
  panel:
    backgroundColor: "{colors.harbor-card}"
    rounded: "{rounded.lg}"
  panel-quiet:
    backgroundColor: "color-mix(in srgb, {colors.harbor-card} 68%, transparent)"
    rounded: "{rounded.lg}"
  eyebrow:
    textColor: "{colors.sea-glass-mint}"
    typography: "{typography.label}"
---

# Design System: ideator.dev

## Overview

**Creative North Star: "The Harbor for Half-Formed Ideas"**

The interface is a sheltered body of water at night. Everything sits on one deep, calm surface (Harbor Water, #1d3440); the only warm light is the mooring lamp of the primary amber (#ffd35c), marking where action happens. Half-formed work floats quietly on translucent panels; nothing shouts, nothing leaves the harbor until it is seaworthy. Density is low, borders are hairline and warm, and every interactive element answers the hand with the same spring easing.

The system is deliberately plain-voiced: no imagery, no illustration, no decoration that doesn't earn its place. Depth comes from one soft shadow vocabulary and a faint 56px workbench grid; color comes from exactly two accents (amber for action, sea-glass mint for wayfinding labels) over warm cream text. The product's binding copy voice — plain, direct, evidence-flavored — extends to the visuals: the workspace should expose weak thinking, not decorate it.

**Key Characteristics:**

- One dark teal-navy field everywhere; cards are lighter stops of the same water, never a different hue family.
- Amber is rare and structural: actions, focus, brand dot. Mint is informational: eyebrows, wayfinding, numbering.
- Light-weight, tight-tracked display type; hierarchy through size and tracking, never bold shouting.
- Spring-eased micro-motion on everything interactive; fully disabled under `prefers-reduced-motion`.
- Pure CSS depth (gradients, grid, glow) — no photography or illustration anywhere.

## Colors

A deep-water palette: one dark teal family for every surface, warm cream for text, and two restrained accents — a warm amber for action and a pale sea-glass mint for labels and wayfinding.

### Primary

- **Mooring-Light Amber** (#ffd35c): The harbor lamp. Primary buttons and their focus ring, the glowing brand dot, active markers, and numeric emphasis. Always paired with Ink Teal (#122630) as its text color.

### Secondary

- **Sea-Glass Mint** (#bceee4): Wayfinding and structure — eyebrow labels, artifact section markers, icons inside accent-tinted chips, and the quiet cyan highlights on the landing. Never used for primary actions.

### Tertiary

- **Warning Coral** (#f08b80): Destructive actions and error states only. Soft, not alarming — it reads as a warning flag, not an alarm.

### Neutral

- **Harbor Water** (#1d3440): The page background — the water itself. Also the base for inputs at rest.
- **Harbor Card** (#274855): Panel and card surfaces, one lighter stop up.
- **Harbor Popover** (#25434f): Popovers and menus, between water and card.
- **Harbor Secondary** (#376375): Secondary filled elements and pressed states.
- **Harbor Muted** (#2f5665): Muted fills, disabled surfaces, icon chips.
- **Lamplight Cream** (#fff7e7): All primary text. Warm, never pure white.
- **Mist Green** (#d3dedc): Muted/secondary text — descriptions, metadata, hints.
- **Cream Border** (rgb(255 247 231 / 22%)): Every hairline border and divider.
- **Cream Input** (rgb(255 247 231 / 30%)): Input strokes, one step above borders.

### Named Rules

**The Mooring-Light Rule.** Amber is the lamp, not the paint. It marks actions, focus, and the brand dot; it is never a background wash, a section tint, or body-text color. On any screen it covers well under 10% of pixels — its rarity is the point.

**The Warm Cream Rule.** Text is always Lamplight Cream (#fff7e7) or Mist Green (#d3dedc), never pure white or pure gray. The harbor is lit by lamps, not fluorescents.

## Typography

**Display Font:** Outfit (with Segoe UI → system-ui fallback)
**Body Font:** Outfit (same family — one voice)
**Label/Mono Font:** ui-monospace stack ("SFMono-Regular", Consolas) for numeric indices, timestamps, and counters, always with `tabular-nums`

**Character:** Outfit's geometric humanist forms feel unhurried and unfussy — a workbench label, not a keynote slide. One family across display and body keeps the whole system in one voice; hierarchy is achieved with weight steps of at most 300→500 and tight negative tracking on large sizes.

### Hierarchy

- **Display** (300–400, text-3xl→6xl / 1.875–3.75rem, line-height 0.98–1.1, tracking −0.04em): Page titles and hero statements. Almost light-weight; `display-type` utility adds −0.045em.
- **Headline** (500, text-2xl→5xl, tracking −0.04 to −0.045em): Section headings on landing and workspace cards.
- **Title** (500, 1.25rem, normal tracking): Card titles, project names, panel headers.
- **Body** (400, 0.875–1rem, line-height 1.5–1.75): Descriptions and form copy; muted text uses Mist Green.
- **Label** (600, 0.68rem, tracking 0.1em, uppercase): The `.eyebrow` pattern — section markers like "01 / the idea lab", always Sea-Glass Mint.
- **Mono** (ui-monospace, 0.68–0.75rem): Step numbers ("01", "02"), counters, and machine-ish metadata.

### Named Rules

**The Quiet Voice Rule.** Large type is light and tight-tracked; it whispers structure. Bold weight (700) is reserved for the brand mark and tiny emphasis, never for headings that already have size.

## Layout

Single-column water with asymmetric two-column grids when content splits. Containers cap at `max-w-6xl` (72rem) with `px-5 → sm:px-8 → lg:px-12` gutters. Vertical rhythm is generous: sections breathe at `py-20` (5rem), key sections at `lg:py-28` (7rem); internal gaps run tight at `gap-3` (0.75rem) for card lists. Split layouts use asymmetric fractions (e.g. `0.7fr/1.3fr`, `1.05fr/0.95fr`) rather than equal halves, with the visual artifact opposite the prose. Minimum viewport 320px (`min-width: 320px` on body); the workbench grid backdrop (56px cells) appears behind the app shell and auth panel. The auth screens compact aggressively for short viewports (dedicated `max-height` tiers down to 26rem) — they are the densest layout constraint in the system.

## Elevation & Depth

Quiet depth: the water is flat at rest; things float softly above it. There is exactly one shadow for floating surfaces and one glow for the brand light; everything else is hairline borders and tonal steps of the same water. The landing hero adds depth with pure-CSS radial glows (`glow-field`: amber at 12% top-right, mint at 9% bottom-left) — never images.

### Shadow Vocabulary

- **Panel float** (`box-shadow: 0 16px 36px rgb(4 18 24 / 18%)`): `.panel` surfaces — the main elevated container.
- **Mooring glow** (`0 0 0 0.08rem rgb(251 191 36 / 10%), 0 0 0.52rem rgb(251 191 36 / 58%)`): the brand-mark dot only. This is the lamp; nothing else glows.

### Named Rules

**The Flat-At-Rest Rule.** Surfaces are flat until interaction. Lift is a response: hover raises a button 2px, press sinks it 1px with a 0.985 scale. Panels do not gain shadows on hover.

## Shapes

Softly rounded, lightly bordered. The base radius is 1rem (`--radius`), with a derived scale: sm 0.6875rem, md 0.8125rem (buttons/inputs), lg 1rem (panels), xl 1.25rem, 2xl 1.5rem (landing hero cards), and a 999px pill for the brand dot and round chips. Every surface is framed by a 1px Cream Border (rgb(255 247 231 / 22%)) — structure comes from these hairlines plus tonal contrast, not from shadows. There are no sharp corners anywhere; the roundest element is always the light (the dot).

## Components

### Buttons

- **Shape:** rounded-md (0.8125rem), minimum heights 44–48px (`min-h-11`/`min-h-12`).
- **Primary:** Mooring-Light Amber fill, Ink Teal text, semibold, `px-5` padding; `.button-lift` gives hover −2px translateY, active +1px and 0.985 scale.
- **Secondary / Ghost:** transparent or amber/10 fill with `border-primary/40`, amber text, no lift beyond color shift.
- **Hover / Focus:** every interactive element inherits a global 200ms transition on the `--ease-spring` curve (a hard base-layer rule, so components can't forget it); focus-visible is a 2px amber outline at 3px offset.
- **Disabled:** `cursor: not-allowed`, no transform.

### Cards / Containers

- **Corner Style:** rounded-lg (1rem); landing feature cards rounded-2xl (1.5rem).
- **Background:** Harbor Card; quiet variant mixes the card to 68% opacity over the water.
- **Shadow Strategy:** one panel-float shadow on `.panel`; `.panel-quiet` has none.
- **Border:** 1px Cream Border; a `border-b`/`border-t` header rule inside dense panels.
- **Internal Padding:** p-5 (1.25rem) standard, p-7–p-10 for hero-adjacent panels.

### Inputs / Fields

- **Style:** 1px Cream Input stroke over Harbor Water, rounded-md, comfortable height (44px+).
- **Focus:** amber ring outline (2px, 3px offset) via the global `:focus-visible` rule.
- **Error:** Warning Coral text with `role="alert"`; state is preserved, never cleared.

### Eyebrow / Section Marker

- **Style:** the `.eyebrow` pattern — 0.68rem, 600, uppercase, 0.1em tracking, Sea-Glass Mint. Often paired with a mono index ("01", "02"). It is the system's wayfinding voice.

### Brand Mark

- **Style:** lowercase "ideator·dev" wordmark, Outfit 700 at −0.055em tracking, with the glowing gradient dot (135°, #fde68a → #fbbf24 → #f97316) between the words. Tone variants: cream text (default) or white (`light`, for the landing hero).

### Navigation

- **App shell:** the header uses Harbor tone (#23414d family) with the same cream hairlines; the landing nav is a quiet header within the hero block.
- **States:** hover shifts color on the spring curve; the Projects link marks the current workspace and the create action remains available at header level.

## Do's and Don'ts

### Do:

- **Do** build every new surface from the theme tokens (`--background`, `--primary`, `--accent`, …) so themes and future re-themes keep working.
- **Do** give every interactive element the 200ms spring feedback — it's a base-layer hard rule; utilities override it, never remove it.
- **Do** use the eyebrow + mono-index pattern for section wayfinding.
- **Do** keep copy plain, direct, and evidence-flavored; name artifacts in plain language (north star, technical blueprint, immediate next step).
- **Do** respect `prefers-reduced-motion` — motion must vanish entirely under it (the system already enforces this).

### Don't:

- **Don't** hardcode raw Tailwind palette colors (`sky-950`, `amber-300`) in product surfaces — map surfaces and actions to the named theme tokens instead.
- **Don't** use amber as a background wash, tint, or text color; amber is only the lamp (actions, focus, brand dot).
- **Don't** introduce a third accent or pure white/gray text; two accents, two cream text tones, that's the palette.
- **Don't** fabricate social proof — no testimonials, press logos, or customer counts exist; the hero template's default press list stays unrendered and should be removed, not used.
- **Don't** add shadows beyond the panel float and mooring glow, or decorative imagery — depth is CSS light on water, nothing else.
