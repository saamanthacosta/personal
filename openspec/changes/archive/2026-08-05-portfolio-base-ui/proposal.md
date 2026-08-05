---
tags:
  - capability/portfolio-ui-system
---

## Why

The portfolio currently mixes subject components, layout components, feature-specific controls, and decorative elements across several folders, while repeated UI patterns are implemented with inconsistent spacing, padding, borders, radii, and typography utilities. Establishing a typed Base UI layer and moving components into flat subject folders will make the visual system predictable, make primitives reusable, and reduce the risk of future sections drifting from the portfolio design.

## What Changes

- Introduce a generic `components/ui/` layer containing `BaseButton`, `BaseIcon`, `BaseCard`, `BaseTimeline`, `BaseInput`, `BaseBadge`, `BaseToggle`, and `BaseTypography`.
- Standardize reusable spacing, padding, surface, control, badge, timeline, and typography variants while preserving the existing light/dark theme and responsive behavior.
- Reorganize portfolio components into flat subject folders such as `about`, `contact`, `hero`, `navigation`, `projects`, `skills`, and `timeline`; remove the `layout`, `sections`, and standalone timeline folder structure. **BREAKING**
- Keep feature-specific components with the subject that owns them, rather than treating them as generic UI primitives.
- Migrate all portfolio source JavaScript modules and Vue script blocks to TypeScript, including application bootstrap, composables, data, i18n setup, and component props/emits.
- Add TypeScript/Vue type-checking configuration and the development dependencies required to build and type-check the portfolio.
- Update all imports and component usage sites to the new paths and remove only verified dead scaffold/style assets that are made obsolete by the reorganization.

## Capabilities

### New Capabilities

- `portfolio-ui-system`: Defines the typed Base UI primitives, shared visual variants, accessibility expectations, and subject-oriented component organization for the portfolio.

### Modified Capabilities


## Impact

- Affects all files under `portfolio/src/`, `portfolio/package.json`, the lockfile, Vite/TypeScript configuration, and component import paths.
- Changes the public internal component API by adding typed Base primitives and moving existing feature components; no external API or backend integration is affected.
- Adds TypeScript tooling and Vue type-checking to the portfolio build workflow.
- Requires `npm run build` and a new type-check command as the verification baseline; the repository currently has no lint or automated test command.

## Target component tree

After the proposal lands, `portfolio/src/components/` will be exactly:

```
src/components/
├── about/
│   └── AboutSection.vue
├── contact/
│   └── ContactSection.vue
├── hero/
│   ├── HeroSection.vue
│   ├── HibiscusFlower.vue
│   └── PetalLeaf.vue
├── navigation/
│   ├── AppNav.vue
│   ├── ThemeToggle.vue
│   └── LanguageToggle.vue
├── projects/
│   └── ProjectsSection.vue
├── skills/
│   ├── SkillsSection.vue
│   └── SkillBadge.vue
├── timeline/
│   ├── TimelineSection.vue
│   └── TimelineItem.vue
└── ui/
    ├── BaseButton.vue
    ├── BaseIcon.vue
    ├── BaseCard.vue
    ├── BaseTimeline.vue
    ├── BaseInput.vue
    ├── BaseBadge.vue
    ├── BaseToggle.vue
    └── BaseTypography.vue
```

Each subject folder owns the components that contain its behavior, copy, data, or styling decisions. The `ui/` folder contains only the eight generic Base primitives, none of which depend on portfolio subject data, i18n keys, or theme composables. There is no `layout/` or `sections/` folder, and the standalone `components/timeline/` directory is replaced by the `timeline` subject folder.

## Security Considerations

- Data classes are limited to existing public portfolio content, contact links, theme/locale preferences, and user-entered values accepted by the new generic input primitive; no secrets or private data are introduced.
- The change crosses only the local browser DOM/component boundary and the existing Google Fonts request; it adds no backend, authentication, authorization, token, or external service boundary.
- Inputs will use typed props, semantic labels, controlled values, and escaped Vue rendering; BaseIcon will preserve decorative versus labelled SVG accessibility semantics.
- Existing localStorage keys remain the only persistence surface and continue to hold non-sensitive theme and locale preferences.
- No privilege boundary is changed. Residual risk is limited to ordinary client-side UI misuse and third-party font availability.

## Related

- [[../design|design]]
- [[../tasks|tasks]]
- [[../specs/portfolio-ui-system/spec|portfolio-ui-system delta spec]]
