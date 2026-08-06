---
title: Component polish checklist
source: built from make-interfaces-feel-better
purpose: Author-side checklist for the principles that make components feel polished. The canonical source of every principle (rationale, edge cases, what to skip) is `make-interfaces-feel-better`; load it for review.
---

# Component polish checklist

Apply alongside the other component references (composition, accessibility,
styling, design-tokens). The rules below are consolidated from
`make-interfaces-feel-better` into a single checklist a component author can
walk before declaring a block done. For the reasoning and the borderline
cases, follow the link to the canonical source.

## Surfaces

- **Concentric radii.** Outer radius = inner radius + padding. Mismatched
  nested radii is the most common "feels off" symptom.
- **Optical over geometric alignment.** Buttons with icons, play triangles,
  and asymmetric icons need manual adjustment, not `center`.
- **Shadows for elevation, borders for structure.** Layered transparent
  `box-shadow` for depth; keep borders that mark structure or state.
- **Minimum hit area.** 44×44 px on touch/mobile, 40×40 px in dense desktop
  UI. Extend with a pseudo-element when the visible control is smaller.
  Adjacent hit areas must not overlap.
- **Image outlines.** Subtle `1px` outline, pure black in light mode
  (`oklch(0 0 0 / 0.1)`), pure white in dark mode (`oklch(1 0 0 / 0.1)`).
  Never a tinted near-black — it picks up the surface and reads as dirt.

## Typography

- **Font smoothing.** `-webkit-font-smoothing: antialiased` on the root
  layout (macOS only).
- **Tabular numbers.** `font-variant-numeric: tabular-nums` on any number
  that updates live, to prevent layout shift.
- **Text wrapping.** `text-wrap: balance` on headings, `text-wrap: pretty`
  on body text. Avoid orphans.

## Animation

- **Interruptible transitions, staged entrances.** Use CSS transitions for
  interactive state changes; reserve keyframes for staged sequences that
  run once.
- **Stagger infrequent entrances only.** Break content into semantic chunks
  and stagger by ~100 ms; do not stagger high-frequency interactions.
- **Subtle exits.** Use a small fixed `translateY` instead of full height.
  `ease-out` for both enter and exit.
- **Icon animations.** `opacity`, `scale`, `blur`. With a motion library
  installed, use `transition: { type: "spring", duration: 0.3, bounce: 0 }`
  — bounce must always be `0`. Without one, keep both icons in the DOM
  (one absolutely positioned) and cross-fade with CSS transitions using
  `cubic-bezier(0.2, 0, 0, 1)`.
- **Scale on press.** `scale(0.96)` on click. Never below `0.95`. Provide a
  `static` prop to disable when motion would distract.
- **Skip animation on page load.** `initial={false}` on `AnimatePresence`
  to prevent first-render enter animations.
- **Specificity.** Never `transition: all`. Specify exact properties.
- **`will-change` sparingly.** Only `transform`, `opacity`, `filter` — and
  only when first-frame stutter is observed.
- **Motion restraint.** No custom animation on high-frequency interactions;
  every animated state change also needs a static cue (color, icon, label).

## Icons

- **Stroke matches text weight.** `1.5px` beside regular (400), `2px` beside
  semibold (600). One stroke weight per icon set; never mix libraries.
- **One SVG, recolored per state.** Icons use `currentColor`; states come
  from CSS color and opacity. Outline is default; fill marks the active
  state.

## Process

- **Identify the styling system first.** Express the change in the
  project's existing system (Tailwind, plain CSS, CSS-in-JS). Never
  introduce a second styling system just to apply a polish fix.
- **Slow the interface down.** During review, replay motion at 10% speed
  in the browser's Animations panel and walk every state: hover, focus,
  active, loading, empty. What feels off at 10% speed is subtly wrong at
  full speed.
- **Load the canonical skill for review.** `make-interfaces-feel-better`
  holds the rationale, the common-mistakes table, and the review output
  format (`quick` / `full`) — load it before publishing a polish review.
- **Ponytail mode does not cut polish.** The principles above are
  off-limits to the lazy ladder. Reach for the project's design tokens;
  do not skip the rule.
