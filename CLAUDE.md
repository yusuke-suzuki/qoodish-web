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

## 4. Code Generation & Modification Guidelines

- When adding new features, follow the existing architectural patterns. For example, a new data type should have its own components in `src/components`, hooks in `src/hooks`, and pages in `src/pages`.
- When creating components, use MUI components (`<Button>`, `<Card>`, `<Typography>`, etc.) as the base.
- Ensure all new code is strongly typed with TypeScript.
- For user-facing text, always use the i18n dictionaries and the `useDictionary` hook. Do not hardcode strings in English or Japanese.

## 5. Commit Message Generation Rules

**IMPORTANT:** All generated commit messages *must* be strictly validated against these rules before being proposed. Pay special attention to line length limits (50 for the subject, 72 for the body). This is a critical step to maintain repository quality.

When generating commit messages, please follow these rules:

- Use conventional commit message format.
- Write in English.
- Use imperative mood.
- Use the present tense.
- Limit the first line to 50 characters or less.
- Separate the subject from the body with a blank line.
- Ensure each line in the body does not exceed 72 characters by inserting line breaks where necessary, including within sentences.
- Separate distinct paragraphs with a blank line.
- Use the body to explain what and why vs. how.
- Reference pull requests if needed.
