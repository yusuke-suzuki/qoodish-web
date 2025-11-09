# Claude Code Context for Qoodish-Web

This document provides essential context for Claude Code to understand the Qoodish-Web project. Please use this information to generate code that is consistent with the existing architecture, conventions, and dependencies.

## 1. Project Overview

- **Name:** Qoodish Web
- **Description:** A web application for sharing and discovering information about places through maps.
- **Repository:** `github.com/yusuke-suzuki/qoodish-web`

## 2. Technology Stack

- **Framework:** Next.js (v14) with Pages Router
- **Language:** TypeScript
- **UI Components:** Material-UI (MUI) v5 and Emotion for styling.
- **State Management / Data Fetching:** SWR is the primary hook for data fetching and caching.
- **Backend & Authentication:** The backend is a Ruby on Rails API available at `github.com/yusuke-suzuki/qoodish`. Firebase is used for authentication and possibly file storage.
- **Mapping:** Google Maps JavaScript API, loaded via `@googlemaps/js-api-loader`.
- **Package Manager:** pnpm

## 3. Architectural Patterns & Conventions

- **Directory Structure:**
    - `src/pages`: Next.js pages for routing.
    - `src/components`: Reusable React components, organized by feature/domain.
    - `src/hooks`: Custom hooks encapsulating business logic and data fetching (e.g., `useMap`, `useReview`).
    - `src/context`: React context providers (e.g., `AuthContext`, `GoogleMapsContext`).
    - `src/utils`: Utility functions.
    - `src/dictionaries`: JSON files for internationalization (i18n).
- **Component Style:** Components are written as functions using TypeScript (`.tsx`). Styling is done using Emotion and MUI components.
- **Data Fetching:** Use SWR hooks for all interactions with the backend. Custom hooks in `src/hooks` are the preferred way to abstract this logic.
- **State Management:** For global state, React Context is used. For server state, SWR is the source of truth.
- **Internationalization (i18n):** The app supports English and Japanese. Text displayed to the user should be retrieved via the `useDictionary` hook.
- **Authentication Flow:** The app uses a unified sign-in/sign-up pattern:
    - Firebase Authentication handles authentication (Google OAuth, Email Link)
    - After successful Firebase auth, `AuthProvider` listens via `onAuthStateChanged`
    - `AuthProvider.signIn(user)` calls backend `POST /users` (Rails API determines if user is new or existing)
    - Backend response sets `currentUser` in AuthContext
    - Supported methods: Google OAuth (`signInWithPopup`), Email Link (`sendSignInLinkToEmail`)
    - Facebook and Twitter authentication have been removed

## 4. Code Generation & Modification Guidelines

- When adding new features, follow the existing architectural patterns. For example, a new data type should have its own components in `src/components`, hooks in `src/hooks`, and pages in `src/pages`.
- When creating components, use MUI components (`<Button>`, `<Card>`, `<Typography>`, etc.) as the base.
- Ensure all new code is strongly typed with TypeScript.
- For user-facing text, always use the i18n dictionaries and the `useDictionary` hook. Do not hardcode strings in English or Japanese.
- **IMPORTANT:** Before pushing code, always run `pnpm biome ci ./src` to verify code quality and formatting. All checks must pass.

## 5. Professional Conduct Guidelines

**IMPORTANT:** Always maintain professional objectivity when
assisting with this project.

- **Scope Management:** Keep tasks focused and well-defined.
  Break down large requests into specific, manageable steps.
  Avoid scope creep by clarifying requirements before
  proceeding.
- **Fact-Based Decision Making:** Make decisions based on
  evidence from the codebase, not assumptions. When uncertain,
  investigate first by reading relevant files or searching the
  codebase.
- **Technical Accuracy Over Validation:** Prioritize technical
  correctness over validating user beliefs. Provide objective,
  honest feedback even if it contradicts expectations.
- **Concise Communication:** Be direct and concise. Avoid
  unnecessary superlatives, excessive praise, or emotional
  validation. Focus on delivering actionable information.
- **Verify Before Acting:** Before making changes, verify
  current state by reading files or running checks. Never make
  assumptions about code structure or behavior.

## 6. Commit Message Generation Rules

**IMPORTANT:** All generated commit messages *must* be strictly validated against these rules before being proposed. Pay special attention to line length limits (50 for the subject, 72 for the body). This is a critical step to maintain repository quality.

When generating commit messages, please follow these rules:

- Use conventional commit message format.
- Write in English.
- Use imperative mood.
- Use the present tense.
- **Limit the first line to 50 characters or less (STRICT).**
  - **VALIDATION REQUIRED:** Before finalizing any commit message,
    count the characters in the subject line to ensure it does
    not exceed 50. If it does, revise to shorten it.
  - Example: "refactor: migrate PWA from Workbox to Serwist"
    (46 chars) is acceptable.
  - Counter-example: "refactor: migrate PWA implementation from
    Workbox to Serwist" (61 chars) is TOO LONG.
- Separate the subject from the body with a blank line.
- Ensure each line in the body does not exceed 72 characters
  by inserting line breaks where necessary, including within
  sentences.
- Separate distinct paragraphs with a blank line.
- Use the body to explain what and why vs. how.
- Reference pull requests if needed.
