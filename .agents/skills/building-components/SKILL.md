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
[polish.md](./references/polish.md); the canonical source of every
principle is `make-interfaces-feel-better`. Load that skill when the
review passes through the polish checklist so the rationale and the
boundary cases (which motion to skip, which icon weight to match) are
in context.

When applying a `ponytail-review` pass for component work, do not let the
lazy ladder trim polish — those principles are off-limits; reach for the
existing design tokens instead.

## References

- [definitions.md](./references/definitions.md) - Artifact taxonomy (primitives, components, blocks, templates)
- [principles.md](./references/principles.md) - Core principles for component design
- [accessibility.md](./references/accessibility.md) - ARIA, keyboard navigation, WCAG compliance
- [composition.md](./references/composition.md) - Composable component patterns
- [as-child.md](./references/as-child.md) - The as-child pattern for element polymorphism
- [polymorphism.md](./references/polymorphism.md) - Polymorphic component patterns
- [types.md](./references/types.md) - TypeScript typing patterns for components
- [state.md](./references/state.md) - Controlled vs uncontrolled state management
- [data-attributes.md](./references/data-attributes.md) - Using data attributes for styling and state
- [design-tokens.md](./references/design-tokens.md) - Design token systems and theming
- [styling.md](./references/styling.md) - Component styling approaches
- [registry.md](./references/registry.md) - shadcn-style registry distribution
- [npm.md](./references/npm.md) - Publishing components to npm
- [marketplaces.md](./references/marketplaces.md) - Component marketplace distribution
- [docs.md](./references/docs.md) - Writing component documentation
- [polish.md](./references/polish.md) - UI polish checklist (consolidated from `make-interfaces-feel-better`)

---

## Interdependencies

| Skill | Nature | Coupling |
| --- | --- | --- |
| `make-interfaces-feel-better` | loads | by name (bare) |
| `ponytail-review` | mentions | by name (bare) |
