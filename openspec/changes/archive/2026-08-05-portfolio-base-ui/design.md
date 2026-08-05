---
tags:
  - capability/portfolio-ui-system
---

## Context

The portfolio is a Vue 3 single-page application built with Vite and Tailwind CSS v4. All application code is currently JavaScript, and the component tree separates `layout`, `sections`, `timeline`, and `ui` folders even though most components are owned by a specific portfolio subject. Buttons, SVG icons, cards, badges, and typography are repeatedly rendered inline with several incompatible spacing and surface choices. Five sections also duplicate the same intersection-observer reveal behavior.

The requested change is an internal component-system migration. It must preserve the existing navigation, theme, locale, responsive layout, animations, links, and displayed content while providing a typed set of generic Base components and a predictable folder convention.

## Goals / Non-Goals

**Goals:**

- Create `components/ui/Base*.vue` primitives for button, icon, card, timeline, input, badge, toggle, and typography.
- Give each primitive a small typed API with semantic defaults, keyboard/focus behavior, and variants for the current portfolio use cases.
- Normalize repeated spacing, padding, border, radius, and text treatment through Base component variants without introducing a separate layout folder.
- Organize feature components under flat subject folders: `about`, `contact`, `hero`, `navigation`, `projects`, `skills`, and `timeline`.
- Migrate every JavaScript file in `portfolio/src/` and the Vite configuration to TypeScript, with strict checking through `vue-tsc`.
- Update existing sections to consume the Base primitives where they represent a matching visual pattern, while keeping subject-specific behavior local to its subject.
- Remove only verified dead scaffold files and duplicated unused style files when they are no longer referenced.

**Non-Goals:**

- No backend, routing, CMS, analytics, authentication, or data-model changes.
- No new visual brand palette, font family, or animation library.
- No generic `BaseContainer`, `BaseSectionHeading`, or layout abstraction beyond the eight requested primitives.
- No new form flow; `BaseInput` is a reusable accessible primitive for future subject use and does not add a contact form.
- No automated test framework adoption in this change; build and type-check are the available mechanical gates.

## Decisions

### Subject-oriented flat folders

Use `src/components/{about,contact,hero,navigation,projects,skills,timeline,ui}`. Move `AppNav`, `ThemeToggle`, and `LanguageToggle` into `navigation`; move decorative hero components into `hero`; move `SkillBadge` into `skills`; and move both timeline components into `timeline`. `ui` contains only the eight generic `Base*` components. This removes the ambiguous `layout`, `sections`, and standalone `timeline` groupings without introducing a second `subjects` wrapper.

Alternative considered: retain `sections/<subject>` or add `subjects/<subject>`. Both add nesting without clarifying ownership and would keep layout terminology in the tree.

### Slot-based Base primitives with typed variant props

Each Base component will use Vue `<script setup lang="ts">`, typed `defineProps`/`defineEmits`, and slots/attrs for content. Components will not depend on application data, i18n keys, theme composables, or subject-specific SVG paths. Variants will encode the canonical spacing and visual choices:

- `BaseButton`: semantic `button` by default, optional anchor rendering, `primary`, `secondary`, `ghost`, and `icon` variants, plus `sm`, `md`, and `lg` sizes.
- `BaseIcon`: currentColor SVG wrapper with typed size and optional accessible title; path content remains a slot so subject icons do not require a registry.
- `BaseCard`: semantic surface with `default`, `muted`, and `dashed` variants and `none`, `sm`, `md`, and `lg` padding.
- `BaseTimeline`: semantic list wrapper with vertical/horizontal orientation and spacing variants; item content remains a slot.
- `BaseInput`: controlled value, typed input attributes, label, hint, error, and required/disabled states with generated or supplied id.
- `BaseBadge`: neutral, primary, accent, success, and warning variants with compact and regular sizes.
- `BaseToggle`: controlled boolean switch using a native checkbox, typed update event, visible label, and disabled state.
- `BaseTypography`: semantic `as` element plus display, heading, lead, body, caption, eyebrow, and mono variants and muted/primary/accent tones.

Alternative considered: create one untyped polymorphic component with arbitrary class strings. That would preserve duplication and make invalid combinations easier to introduce.

### Preserve behavior while standardizing repeated surfaces

Existing section components will use Base components for matching repeated patterns: CTA/control buttons, SVG wrappers, card surfaces, skill/status chips, timeline list structure, and section text treatments. Subject components retain their existing i18n, theme, observer, decorative, and data behavior. The Base variants will use the current Tailwind palette and responsive utility conventions; changes to radius, border, and padding are intentional design-system normalization rather than content changes.

The timeline last-item calculation will be derived from the actual data length instead of a fixed index, removing a hidden five-item assumption while preserving the current data rendering.

### Strict TypeScript migration

Rename standalone source modules to `.ts`, add `lang="ts"` to every Vue script block, and migrate the Vite config to `vite.config.ts`. Add `typescript`, `vue-tsc`, and the minimal Vite/Vue type declarations needed for checking. Configure `tsconfig.json` with strict checking, bundler module resolution, DOM/Vite types, no emit, and Vue/Vite source inclusion. Define explicit types for timeline records, skills, contact data, theme/locale values, directive element state, props, emits, and template-facing computed values.

Alternative considered: enable `allowJs` and type only new primitives. That would leave the existing application untyped and would not satisfy the requested migration of the portfolio files.

### Keep configuration and tokens local to the portfolio

The existing Tailwind v4 CSS-first theme in `src/assets/styles/base.css` remains the source of truth for brand colors and fonts. Base components use those tokens and standard Tailwind spacing utilities; no Tailwind config file or new styling dependency will be introduced. TypeScript configuration remains in `portfolio/` and does not affect sibling projects.

## Risks / Trade-offs

- [Risk] Moving many SFCs can leave stale relative imports or auto-registration assumptions → update every explicit import and run a production build plus type-check after the move.
- [Risk] Canonical card and control variants change some existing spacing/radius details → keep variants explicit, map each current usage deliberately, and compare all sections through a manual smoke checklist.
- [Risk] Strict checking exposes pre-existing implicit types and browser-only globals → add narrow domain types and lifecycle guards without changing runtime behavior.
- [Risk] `BaseInput` and `BaseToggle` have no current production consumers → keep them dependency-free and tested by type-checking/render contract; do not invent a form flow.
- [Risk] Removing dead files can hide an indirect reference → verify references before deletion and confirm the built asset graph succeeds.
- [Risk] Google Fonts remain a third-party network dependency → retain the current non-secret CSS import and document fallback fonts; no new external service is introduced.

## Migration Plan

1. Create the Base primitives and TypeScript configuration without changing route or content behavior.
2. Move subject components and migrate all source/config modules, updating imports and typing APIs.
3. Replace matching inline patterns with Base primitives and remove verified dead files.
4. Run `npm run typecheck` and `npm run build`; manually smoke-test navigation, locale, theme, timeline, responsive breakpoints, and reduced-motion behavior.
5. Rollback is a branch-level revert of the single change; no persisted data or external API migration is required.

## Open Questions

None. The approved structure is flat subject folders with a generic `ui` folder, and the TypeScript scope is all portfolio source files plus the Vite configuration.

## Security Considerations

- Data classes: existing public portfolio text, public contact URLs, theme and locale preferences in localStorage, and future user-entered strings accepted by `BaseInput`; no secrets are read or exposed.
- Trust boundaries: the browser DOM, Vue template rendering, localStorage, and the existing Google Fonts request; no server, API, authentication, or third-party runtime integration is added.
- Mitigations: use Vue's escaped interpolation, typed props and emits, semantic native controls, explicit labels and errors, safe anchor attributes for external links, and `currentColor` SVGs with correct decorative/labelled ARIA behavior.
- Persistence: only the existing non-sensitive `portfolio-theme` and `portfolio-locale` keys remain; Base primitives do not persist state.
- Authentication and privilege: the change does not touch sessions, tokens, permissions, or privilege boundaries.
- Residual risk: a malicious string could still be supplied to a future consumer if it deliberately opts into raw HTML or unsafe URL construction; this change does not add either capability and provides no security override.

## Security Overrides

- The pre-archive CVE audit (`docs/cve-reports/2026-08-05-pre-archive-portfolio-base-ui.md`) lists five HIGH findings, all in pre-existing workspace tooling scripts under `.agents/skills/` that are not in this change's diff. These findings exist on the workspace tree and are unrelated to the portfolio UI migration. They are accepted here and tracked for a separate workspace-tooling change.

## Related

- [[../proposal|proposal]]
- [[../tasks|tasks]]
- [[../specs/portfolio-ui-system/spec|portfolio-ui-system delta spec]]
