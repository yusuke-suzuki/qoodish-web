<!--
Sync Impact Report - Constitution v1.1.0
Generated: 2025-10-07

VERSION CHANGE: 1.0.0 → 1.1.0
RATIONALE: MINOR bump - New principle added (Standard APIs First)

PRINCIPLES MODIFIED:
- Added VI. Standard APIs First (new principle)

PRINCIPLES UNCHANGED:
- I. TypeScript-First Development
- II. Component Architecture
- III. Internationalization (i18n)
- IV. Code Quality Standards
- V. Commit Message Discipline

SECTIONS UPDATED:
- Core Principles (5 → 6 principles)
- Code Review Requirements (added standard APIs checklist item)

TEMPLATE CONSISTENCY STATUS:
✅ plan-template.md - Constitution Check section updated with VI
✅ spec-template.md - No changes needed (implementation-agnostic)
✅ tasks-template.md - No changes needed (aligns with principles)
✅ .claude/commands/*.md - No changes needed

FOLLOW-UP ITEMS:
- None - all updates complete
-->

# Qoodish Web Constitution

## Core Principles

### I. TypeScript-First Development

All code MUST be strongly typed with TypeScript. Components, hooks, utilities,
and context providers MUST have explicit type definitions. The `any` type is
prohibited except when interfacing with untyped third-party libraries, and
MUST be documented with justification.

**Rationale**: Type safety prevents runtime errors, improves code
maintainability, and provides better developer experience through IDE
autocompletion and refactoring tools.

### II. Component Architecture

Components MUST follow the established architectural patterns:
- React functional components written in TypeScript (`.tsx`)
- MUI components as the base UI building blocks
- Emotion for styling integration
- Custom hooks in `src/hooks/` for business logic and data fetching
- React Context in `src/context/` for global state
- SWR as the source of truth for server state

Components MUST be organized by feature/domain within `src/components/`.
Reusable components MUST be self-contained with clear responsibilities.

**Rationale**: Consistent architecture enables team scalability, reduces
cognitive load, and maintains code predictability across the application.

### III. Internationalization (i18n)

User-facing text MUST be retrieved via the `useDictionary` hook from
`src/dictionaries/` JSON files. Hardcoded strings in English or Japanese
are prohibited in components, pages, and UI logic.

The application MUST support English and Japanese locales. New features
MUST include translations for both languages before merge.

**Rationale**: Internationalization as a first-class principle ensures
global accessibility and prevents technical debt from retrofitting
translations later.

### IV. Code Quality Standards (NON-NEGOTIABLE)

Before pushing code, developers MUST run `pnpm biome ci ./src` and all
checks MUST pass. This gate is non-negotiable and enforced by CI/CD.

Code MUST adhere to:
- Biome formatting and linting rules
- No ESLint errors or warnings
- TypeScript strict mode compliance

**Rationale**: Automated quality gates maintain consistent code style,
catch bugs early, and reduce review cycle time by eliminating subjective
formatting discussions.

### V. Commit Message Discipline

All commit messages MUST follow conventional commit format with strict
limits:
- Subject line: 50 characters maximum (imperative mood, present tense)
- Body lines: 72 characters maximum
- Format: `type: subject\n\nbody`
- Validation REQUIRED before finalizing commits

**Rationale**: Structured commit history enables automated changelog
generation, improves git log readability, and communicates intent clearly
to future maintainers.

### VI. Standard APIs First

Web standard APIs (browser) and Node.js standard APIs MUST be preferred
over third-party libraries. New dependencies require explicit
justification demonstrating that standard APIs are insufficient.

Examples of preferred standard APIs:
- Fetch API over axios/request libraries
- Web Crypto API over crypto libraries (browser context)
- Built-in JSON methods over parsing libraries
- URLSearchParams over query string libraries
- Internationalization API over i18n formatting libraries

Dependencies are permitted when:
- Standard API lacks required functionality (documented)
- Framework integration requires specific libraries (e.g., Next.js, React)
- Significant complexity reduction justifies the trade-off

**Rationale**: Minimizing dependencies reduces bundle size, eliminates
supply chain security risks, improves long-term maintainability, and
leverages platform optimizations. Standard APIs have better performance
and stability guarantees.

## Development Standards

### Data Fetching

SWR hooks MUST be used for all backend interactions. Custom hooks in
`src/hooks/` are the preferred abstraction layer. Direct fetch calls or
alternative data fetching libraries are prohibited without architectural
review.

### Directory Structure Compliance

Code MUST be placed in the appropriate directory:
- `src/pages/`: Next.js pages (routing)
- `src/components/`: Reusable React components
- `src/hooks/`: Custom hooks
- `src/context/`: React context providers
- `src/utils/`: Utility functions
- `src/dictionaries/`: i18n JSON files

Violations of directory conventions require architectural justification.

### Testing Requirements

While explicit test-first development is not mandated, features MUST
include appropriate test coverage before merge. Integration points with
Firebase authentication and backend API MUST have contract tests.

## Code Review Requirements

Pull requests MUST pass the following checklist before approval:

- [ ] TypeScript strict mode compliance (no `any` without justification)
- [ ] `pnpm biome ci ./src` passes with zero errors
- [ ] i18n dictionaries updated for English and Japanese
- [ ] MUI components used for UI (no custom HTML primitives without reason)
- [ ] Custom hooks used for data fetching (SWR-based)
- [ ] Directory structure conventions followed
- [ ] Commit messages follow 50/72 character limits
- [ ] No hardcoded user-facing strings
- [ ] Standard APIs preferred over third-party dependencies

## Governance

This constitution supersedes ad-hoc practices and coding preferences.
All development decisions MUST align with the principles above or document
justified exceptions in the Complexity Tracking section of implementation
plans.

**Version**: [CONSTITUTION_VERSION] | **Ratified**: [RATIFICATION_DATE] | **Last Amended**: [LAST_AMENDED_DATE]
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->
### Amendment Process

Amendments to this constitution require:
1. Documented rationale with concrete examples of pain points
2. Review by project maintainers
3. Migration plan for existing code if principles change
4. Version bump following semantic versioning rules

### Versioning Policy

Constitution versions follow MAJOR.MINOR.PATCH:
- MAJOR: Backward incompatible principle removals or redefinitions
- MINOR: New principles added or materially expanded guidance
- PATCH: Clarifications, wording refinements, typo fixes

### Compliance Review

All pull requests MUST verify constitutional compliance. Violations
flagged during review MUST be resolved before merge. Persistent patterns
of non-compliance indicate need for tooling, documentation, or principle
revision.

**Version**: 1.1.0 | **Ratified**: 2025-10-07 | **Last Amended**: 2025-10-07
