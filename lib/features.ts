/**
 * Feature flags for Keepsleeve.
 *
 * STATIC_DEMO = true
 *  - Hides sign-in / account UI
 *  - Uses localStorage for binder saves (no Postgres / API)
 *  - Enables `output: "export"` builds for GitHub Pages
 *
 * Flip to false when you want the full backend + accounts again.
 */
export const STATIC_DEMO = true;

/** Backend auth, Postgres, and /api routes are used only when this is true. */
export const BACKEND_ENABLED = !STATIC_DEMO;

/** localStorage namespace for the static/demo binder */
export const DEMO_USER_ID = "keepsleeve-demo";

/**
 * Optional base path for GitHub Pages project sites, e.g. "/trading-card-studio".
 * Leave empty for local `next dev` / root hosting.
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(
  /\/$/,
  "",
);

/** Prefix an app path with BASE_PATH when needed (plain <a href>). */
export function withBasePath(path: string): string {
  if (!path || path.startsWith("#") || path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${normalized}`;
}
