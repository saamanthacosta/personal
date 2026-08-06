---
name: building-components
description: Guide for building modern, accessible, and composable UI components. Use when building new components, implementing accessibility, creating composable APIs, setting up design tokens, publishing to npm/registry, or writing component documentation.
---

# Building Components

## When to use this skill

Use when the user is:

- Building new UI components (primitives, components, blocks, templates)
- Implementing accessibility features (ARIA, keyboard navigation, focus management)
- Creating composable component APIs (slots, render props, controlled/uncontrolled state)
- Setting up design tokens and theming systems
- Publishing components to npm or a registry
- Writing component documentation
- Implementing polymorphism or as-child patterns
- Working with data attributes for styling/state

## Polish is part of the work

A component that hits every composability and accessibility rule but ships
with mismatched nested radii, `transition: all` hover, or proportional
digits in a live counter still feels broken. Treat UI polish as a build
gate, not a final-pass nice-to-have. The consolidated checklist lives in
[polish.mdx](./references/polish.mdx); the canonical source of every
principle is `make-interfaces-feel-better`. Load that skill when the
review passes through the polish checklist so the rationale and the
boundary cases (which motion to skip, which icon weight to match) are
in context.

When applying a `ponytail-review` pass for component work, do not let the
lazy ladder trim polish — those principles are off-limits; reach for the
existing design tokens instead.

## References

- [definitions.mdx](./references/definitions.mdx) - Artifact taxonomy (primitives, components, blocks, templates)
- [principles.mdx](./references/principles.mdx) - Core principles for component design
- [accessibility.mdx](./references/accessibility.mdx) - ARIA, keyboard navigation, WCAG compliance
- [composition.mdx](./references/composition.mdx) - Composable component patterns
- [as-child.mdx](./references/as-child.mdx) - The as-child pattern for element polymorphism
- [polymorphism.mdx](./references/polymorphism.mdx) - Polymorphic component patterns
- [types.mdx](./references/types.mdx) - TypeScript typing patterns for components
- [state.mdx](./references/state.mdx) - Controlled vs uncontrolled state management
- [data-attributes.mdx](./references/data-attributes.mdx) - Using data attributes for styling and state
- [design-tokens.mdx](./references/design-tokens.mdx) - Design token systems and theming
- [styling.mdx](./references/styling.mdx) - Component styling approaches
- [registry.mdx](./references/registry.mdx) - shadcn-style registry distribution
- [npm.mdx](./references/npm.mdx) - Publishing components to npm
- [marketplaces.mdx](./references/marketplaces.mdx) - Component marketplace distribution
- [docs.mdx](./references/docs.mdx) - Writing component documentation
- [polish.mdx](./references/polish.mdx) - UI polish checklist (consolidated from `make-interfaces-feel-better`)

---

## Interdependencies

| Skill | Nature | Coupling |
| --- | --- | --- |
| `make-interfaces-feel-better` | loads | by name (bare) |
| `ponytail-review` | mentions | by name (bare) |
