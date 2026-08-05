## ADDED Requirements

### Requirement: Portfolio components SHALL use subject-oriented folders
The portfolio SHALL organize feature components under flat `components/about`, `components/contact`, `components/hero`, `components/navigation`, `components/projects`, `components/skills`, and `components/timeline` folders. The `components/ui` folder SHALL contain only generic components whose filenames begin with `Base`, and the portfolio SHALL NOT use `components/layout`, `components/sections`, or a standalone `components/timeline` folder outside the subject folder.

#### Scenario: Existing feature component is moved to its owner
- **WHEN** a component is specific to navigation, hero, skills, or timeline behavior
- **THEN** it is stored in that subject folder and imported from the subject path

#### Scenario: Generic component is added
- **WHEN** a reusable primitive is added to the component library
- **THEN** its file is stored under `components/ui` and its filename begins with `Base`

### Requirement: The Base UI layer SHALL provide the requested typed primitives
The portfolio SHALL provide `BaseButton`, `BaseIcon`, `BaseCard`, `BaseTimeline`, `BaseInput`, `BaseBadge`, `BaseToggle`, and `BaseTypography` as Vue components using typed props, emits, and slots where applicable. Base components SHALL remain independent of portfolio subject data, i18n messages, and feature composables.

#### Scenario: Primitive API is consumed by a subject
- **WHEN** a subject component imports a Base primitive with valid props
- **THEN** the component renders the requested slot content and variant without requiring subject-specific state

#### Scenario: Invalid primitive usage is checked
- **WHEN** a Base primitive receives an invalid prop or emit payload in TypeScript source
- **THEN** `npm run typecheck` reports the usage as a type error

### Requirement: Base primitives SHALL standardize visual spacing and variants
The Base components SHALL expose finite typed variants for the repeated portfolio patterns rather than requiring callers to duplicate arbitrary spacing classes. `BaseButton` SHALL support semantic control variants and sizes, `BaseCard` SHALL support surface and padding variants, `BaseBadge` SHALL support status/color variants, and `BaseTypography` SHALL support semantic text variants and tones. Existing light/dark palette tokens and responsive behavior SHALL remain available through those variants.

#### Scenario: Shared card surface is rendered
- **WHEN** a subject renders `BaseCard` with its default, muted, or dashed variant and a supported padding value
- **THEN** the card uses the canonical portfolio surface, border, radius, and padding classes for that combination

#### Scenario: Shared control is rendered
- **WHEN** a subject renders `BaseButton` or `BaseBadge` with a supported variant and size
- **THEN** the control uses the canonical spacing, focus, radius, and color treatment without requiring inline design-system classes

#### Scenario: Typography hierarchy is rendered
- **WHEN** a subject renders `BaseTypography` with a supported semantic variant
- **THEN** the component renders the requested semantic element and canonical font, size, line-height, and tone classes

### Requirement: Base controls SHALL preserve accessible native semantics
`BaseButton` SHALL render a native button by default and support links only when explicitly configured. `BaseInput` SHALL associate its label, hint, and error text with the native input. `BaseToggle` SHALL use a native checkbox control with a visible or programmatically associated label. Disabled, required, invalid, and focus-visible states SHALL be represented in the rendered control semantics.

#### Scenario: Button receives keyboard focus
- **WHEN** a keyboard user tabs to an enabled `BaseButton`
- **THEN** the control is focusable and displays the portfolio focus-visible treatment

#### Scenario: Input displays validation feedback
- **WHEN** `BaseInput` receives an error message
- **THEN** it marks the native input invalid and associates the error text through `aria-describedby`

#### Scenario: Toggle changes state
- **WHEN** a user activates an enabled `BaseToggle` with keyboard or pointer input
- **THEN** the native checkbox changes state and emits the typed `update:modelValue` event

### Requirement: BaseIcon SHALL distinguish decorative and meaningful graphics
`BaseIcon` SHALL provide a currentColor SVG wrapper with a typed size API and SHALL render decorative icons as hidden from assistive technology unless a meaningful accessible title or label is supplied. Subject-specific path content SHALL be passed through the component slot.

#### Scenario: Decorative icon is rendered
- **WHEN** `BaseIcon` is used without an accessible title or label
- **THEN** the SVG is marked decorative and does not create an unnamed screen-reader announcement

#### Scenario: Meaningful icon is rendered
- **WHEN** `BaseIcon` is used with an accessible title or label
- **THEN** the SVG exposes that accessible name while preserving the supplied path slot

### Requirement: BaseTimeline SHALL provide a generic semantic timeline wrapper
`BaseTimeline` SHALL render a semantic list container by default, support typed vertical or horizontal orientation and spacing variants, and expose item content through a slot. Subject-specific timeline item rendering SHALL remain outside the Base component.

#### Scenario: Timeline section renders experience items
- **WHEN** the timeline subject supplies its experience records to `BaseTimeline`
- **THEN** the wrapper renders the records in order with the existing subject-specific item content and responsive layout

#### Scenario: Timeline orientation changes
- **WHEN** a consumer selects a supported horizontal or vertical orientation
- **THEN** the wrapper applies the corresponding typed layout variant without changing item content

### Requirement: All portfolio source modules SHALL be TypeScript checked
All JavaScript modules under `portfolio/src` SHALL be migrated to `.ts`, all Vue script blocks SHALL declare `lang="ts"`, and the Vite configuration SHALL be TypeScript. The project SHALL provide a strict `tsconfig.json` and an npm `typecheck` script backed by `vue-tsc --noEmit`.

#### Scenario: Type-check command succeeds
- **WHEN** a developer runs `npm run typecheck` from `portfolio`
- **THEN** Vue templates, component props/emits, composables, data modules, i18n setup, directives, and configuration are checked with no errors

#### Scenario: Production build succeeds after migration
- **WHEN** a developer runs `npm run build` from `portfolio`
- **THEN** Vite builds the migrated TypeScript/Vue application without unresolved imports or runtime compilation errors

### Requirement: Existing portfolio behavior SHALL remain intact after migration
The migration SHALL preserve the existing routes/anchors, public text, i18n behavior, theme persistence and system-theme handling, navigation menu behavior, responsive section rendering, timeline confidentiality/current-state behavior, decorative animation behavior, external links, and reduced-motion support.

#### Scenario: Theme and locale preferences are restored
- **WHEN** a visitor reloads the portfolio after choosing a theme or locale
- **THEN** the existing localStorage keys are read and the document theme/language behavior remains unchanged

#### Scenario: Responsive portfolio is rendered
- **WHEN** a visitor uses mobile, tablet, or desktop viewport widths
- **THEN** navigation, sections, cards, timeline content, and Base controls retain their responsive behavior without overflow introduced by the refactor

#### Scenario: Motion preference is reduced
- **WHEN** the visitor has `prefers-reduced-motion: reduce` enabled
- **THEN** the existing reduced-motion CSS behavior remains effective for migrated subject and Base components
