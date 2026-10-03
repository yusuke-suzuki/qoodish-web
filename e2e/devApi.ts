// The in-app proxy only exposes what the browser needs, so the rest of the
// guest API is read at its own origin.
export const API_BASE_URL =
  process.env.E2E_API_URL ?? 'https://api-dev.qoodish.com';
