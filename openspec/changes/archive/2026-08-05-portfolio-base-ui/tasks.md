---
tags:
  - capability/portfolio-ui-system
---

## 1. TypeScript and project setup

- [x] 1.1 Add strict TypeScript, Vue type-checking, and Vite type configuration plus the `typecheck` npm script.
- [x] 1.2 Rename `main.js` and `vite.config.js` to TypeScript files and define typed directive/config boundaries.
- [x] 1.3 Migrate `composables`, `data`, and `i18n` JavaScript modules to typed `.ts` files without changing runtime behavior.

## 2. Base UI primitives

- [x] 2.1 Implement typed `BaseButton` with semantic button/anchor rendering, variants, sizes, disabled state, and forwarded attributes.
- [x] 2.2 Implement typed slot-based `BaseIcon` with sizes and decorative/labelled SVG accessibility behavior.
- [x] 2.3 Implement typed `BaseCard` with canonical surface, border, radius, padding, and semantic element variants.
- [x] 2.4 Implement typed `BaseTimeline` with semantic list rendering, orientation, spacing variants, and item slots.
- [x] 2.5 Implement typed `BaseInput` with controlled value, label, hint/error descriptions, required/disabled states, and input attributes.
- [x] 2.6 Implement typed `BaseBadge` with canonical status variants, sizes, pill support, and slot content.
- [x] 2.7 Implement typed `BaseToggle` with native checkbox semantics, controlled boolean state, label, disabled state, and typed update event.
- [x] 2.8 Implement typed `BaseTypography` with semantic element, text variant, tone, alignment, and slot content props.

## 3. Subject-oriented component migration

- [x] 3.1 Create flat subject directories and move navigation, hero, skills, and timeline feature components to their owning folders.
- [x] 3.2 Move the remaining section components into their `about`, `contact`, `projects`, and subject folders and migrate every Vue script block to `lang="ts"`.
- [x] 3.3 Update all imports, template references, props, emits, computed values, observers, and data access for the new paths and explicit types.
- [x] 3.4 Derive timeline last-item behavior from the actual item collection and preserve current/confidential rendering and animation behavior.

## 4. Apply the Base system

- [x] 4.1 Replace repeated buttons and CTA/control chrome with `BaseButton` while preserving navigation, theme, locale, and mobile-menu behavior.
- [x] 4.2 Replace repeated inline SVG wrappers with `BaseIcon` and preserve each icon's path, size, and accessible meaning.
- [x] 4.3 Replace repeated card surfaces with `BaseCard` and normalize subject card spacing, borders, radii, and dark-mode treatments.
- [x] 4.4 Use `BaseTimeline` for the timeline subject and `BaseBadge` for skill, technology, hero, and current-state badges.
- [x] 4.5 Use `BaseTypography` for recurring section headings, labels, and body treatments without changing translated content.

## 5. Cleanup and verification support

- [x] 5.1 Remove the obsolete `layout`, `sections`, and old timeline paths after confirming no references remain.
- [x] 5.2 Remove verified dead scaffold components, unused animation/style modules, and unreferenced assets made obsolete by the migration.
- [x] 5.3 Review the final component tree and source imports for stale JavaScript, old folder paths, untyped component scripts, or accidental layout primitives.
- [x] 5.4 Run `npm run typecheck` and `npm run build`; both pass (`vue-tsc --noEmit` clean, `vite build` 211.10 kB JS / 70.55 kB CSS).

## Related

- [[../proposal|proposal]]
- [[../design|design]]
- [[../specs/portfolio-ui-system/spec|portfolio-ui-system delta spec]]
