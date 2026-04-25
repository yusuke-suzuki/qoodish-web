# Claude Code Context for Qoodish-Web

This document provides essential context for Claude Code to understand the Qoodish-Web project. Please use this information to generate code that is consistent with the existing architecture, conventions, and dependencies.

## 1. Project Overview

- **Name:** Qoodish Web
- **Description:** A web application for sharing and discovering information about places through maps.
- **Repository:** `github.com/yusuke-suzuki/qoodish-web`

## 2. Technology Stack

- **Framework:** Next.js (v15) with App Router
- **Language:** TypeScript
- **UI Components:** Material-UI (MUI) v7 and Emotion for styling.
- **Data Fetching:** An internal BFF (`src/lib/api.ts`) wraps the Rails API. Server Components and Server Actions call per-domain fetchers in `src/lib/`; client components reach the same backend through internal route handlers under `src/app/api/`. SWR is no longer used.
- **Backend & Authentication:** The backend is a Ruby on Rails API available at `github.com/yusuke-suzuki/qoodish`. Firebase is used for authentication and possibly file storage.
- **Mapping:** Google Maps JavaScript API, loaded via `@googlemaps/js-api-loader`.
- **Package Manager:** pnpm

## 3. Architectural Patterns & Conventions

- **Directory Structure:**
    - `src/app`: App Router routes, locale-prefixed under `[lang]`. Internal API route handlers live under `src/app/api/`.
    - `src/actions`: Server Actions (`'use server'`) for all mutations.
    - `src/lib`: Internal BFF — `api.ts` wraps the Rails API with auth and `Accept-Language` headers; per-domain fetchers (`maps.ts`, `reviews.ts`, `users.ts`, `auth.ts`) call it from Server Components and Server Actions.
    - `src/components`: Reusable React components, organized by feature/domain.
    - `src/components/common`: Shared components referenced by multiple features. Place components here when they are used across two or more feature directories.
    - `src/hooks`: Custom client hooks (e.g., `useDictionary`, `useMapSearch`). Data-fetching SWR hooks have been removed — fetch on the server in `src/lib/` instead.
    - `src/context`: React context providers (e.g., `AuthContext`, `GoogleMapsContext`).
    - `src/utils`: Utility functions.
    - `src/dictionaries`: JSON files for internationalization (i18n).
- **Component Style:** Components are written as functions using TypeScript (`.tsx`). Styling is done using Emotion and MUI components.
- **Data Fetching:** For initial render, fetch on the server in Server Components via the per-domain fetchers in `src/lib/`. For client-side fetches (e.g., search-as-you-type), call the internal API route handlers under `src/app/api/`. Mutations go through Server Actions in `src/actions/`.
- **State Management:** For global state, React Context is used. Server state is fetched on the server and passed down as props; after a Server Action mutation, refresh by re-invoking the server fetch (e.g., `router.refresh()` or refetching the parent query) — there is no client-side cache layer like SWR to mutate.
- **Internationalization (i18n):** The app supports English and Japanese. Text displayed to the user should be retrieved via the `useDictionary` hook.
- **Authentication Flow:** The app uses a unified sign-in/sign-up pattern:
    - Firebase Authentication handles authentication (Google OAuth, Email Link)
    - After successful Firebase auth, `AuthProvider` listens via `onAuthStateChanged`
    - `AuthProvider.signIn(user)` calls backend `POST /users` (Rails API determines if user is new or existing)
    - Backend response sets `currentUser` in AuthContext
    - Supported methods: Google OAuth (`signInWithPopup`), Email Link (`sendSignInLinkToEmail`)
    - Facebook and Twitter authentication have been removed

## 4. Code Generation & Modification Guidelines

- When adding new features, follow the existing architectural patterns. For example, a new data type should have its server fetchers in `src/lib/`, mutations in `src/actions/`, components in `src/components/`, and routes in `src/app/[lang]/`.
- When creating components, use MUI components (`<Button>`, `<Card>`, `<Typography>`, etc.) as the base.
- Ensure all new code is strongly typed with TypeScript.
- For user-facing text, always use the i18n dictionaries and the `useDictionary` hook. Do not hardcode strings in English or Japanese.
- **Responsive Layout:** Design mobile-first. Every layout must function on small screens — buttons must not overflow their containers, and text must not be truncated in a way that makes it ambiguous or unintelligible. Use MUI's responsive utilities (`sx` breakpoints, `useMediaQuery`) to adapt layouts across screen sizes.
- **Web Standards:** Prefer web standards (HTML/CSS/JavaScript built-ins and Web APIs documented on MDN) over third-party library equivalents. Question whether a dependency is needed before reaching for one; browser-native solutions (Intersection Observer, ResizeObserver, CSS animations, etc.) are preferred when they fully cover the use case.
- **IMPORTANT:** Before pushing code, run both `pnpm biome ci ./src` (lint/format) and `pnpm exec tsc --noEmit` (type check). All checks must pass.
