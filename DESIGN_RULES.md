# ideator.dev — Design Rules (HARD RULES)

These are non-negotiable project constraints. Any change that violates them is a bug, regardless of how it looks in isolation.

## 1. No boxy corners

- Every visible container, card, control, input, and media surface MUST have rounded corners.
- Never use `rounded-none`, `rounded` (4px), or arbitrary radii below the scale below.
- All radii derive from the single token `--radius` in `packages/ui/src/styles/globals.css`:

| Token | Value | Use for |
|---|---|---|
| `--radius-sm` | calc(--radius - 5px) | tiny chips, badges |
| `--radius-md` | calc(--radius - 3px) | buttons, small controls |
| `--radius-lg` | `--radius` | panels, inputs |
| `--radius-xl` | calc(--radius + 4px) | cards |
| `--radius-2xl+` | larger | feature blocks |

- Arbitrary values like `rounded-[10px]` are forbidden; use the nearest token.
- Fully-round elements (dots, pills, avatars) use `rounded-full`.

## 2. Motion

- CUBIC-BEZIER IS BANNED. Never write `cubic-bezier(...)` for transitions.
- Easing comes from the `linear()` spring tokens defined in `globals.css`:
  - `--ease-spring` — DEFAULT for all transitions and EVERY hover effect
    (snappy decel with a subtle overshoot).
  - `--ease-soft` — pure deceleration, only for pure color/opacity fades
    where overshoot cannot read.
  - Usage: `ease-spring` / `ease-soft` Tailwind utilities, or
    `var(--ease-spring)` in CSS.
- A base-layer fallback in `globals.css` gives every interactive element
  (`a`, `button`, `input`, `label`, ...) eased feedback automatically.
  Do not rely on it as an excuse to omit intentional transitions.
- Durations:
  - Micro-feedback (hover, press, color/transform ticks): 150–250ms
  - Entrance/reveal animations: 350–650ms
  - Nothing longer than 800ms.
- Above-the-fold entrances animate ON MOUNT (`animate=`), not scroll-gated (`whileInView`).
  `whileInView` is allowed only for content below the fold.
- Every animation must degrade under `prefers-reduced-motion` (the global guard in
  `globals.css` handles CSS; JS motion must check `useReducedMotion()`).

## 3. Color tokens

- No hardcoded hex colors in components. Use semantic tokens only:
  background, foreground, card, popover, primary (+foreground), secondary,
  muted (+foreground), accent (+foreground), destructive, border, input, ring.

## 4. States

Every interactive element ships with its real states: hover, focus-visible, active,
disabled/pending. No inert look-alike controls.

## 5. Product naming

- Working titles use descriptive sentence case and say what the idea does.
- Two-word Title Case compounds are forbidden. Never combine abstract or evocative
  words into names such as `Signal Garden`, `First Light`, or `Trace Garden`.
- Do not perform startup branding during ideation. Avoid fused words, arbitrary
  metaphors, and made-up wordmarks.
- Prefer `Offline pantry count`, `Decision check after meetings`, or
  `Local trace explorer`.
