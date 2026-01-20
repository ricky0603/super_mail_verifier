# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains the Next.js App Router pages, route handlers under `app/api/`, layouts, and route-level assets (icons, images).
- `components/` holds reusable UI components (buttons, sections, modals).
- `libs/` provides service integrations and helpers (e.g., `stripe.js`, `supabase/`, `resend.js`, `seo.js`).
- `public/` stores static assets served as-is.
- Root configs include `next.config.js`, `tailwindcss`/`postcss` config, `middleware.js`, and `next-sitemap.config.js`.

## Build, Test, and Development Commands
- `npm run dev` starts local development with Next.js (Turbopack).
- `npm run build` creates the production build.
- `npm run postbuild` generates the sitemap via `next-sitemap`.
- `npm run start` runs the production server from the build output.
- `npm run lint` runs Next.js ESLint rules.

## Coding Style & Naming Conventions
- JavaScript/JSX with 2-space indentation, double quotes, and semicolons (follow existing files like `app/page.js`).
- Components are PascalCase (e.g., `ButtonSignin`, `FeaturesGrid`).
- Keep Tailwind + daisyUI utility classes in JSX; avoid inline styles unless necessary.
- Use `next lint` to enforce style; keep imports sorted logically (Next.js, libs, components).

## Testing Guidelines
- No dedicated test framework is configured in this repo.
- Use `npm run lint` for baseline checks. If adding tests, document how to run them in this file.

## Commit & Pull Request Guidelines
- Recent history uses conventional prefixes such as `feat:`, `fix:`, `style:`; some commits include emojis. Prefer `type: short summary` (lowercase, imperative).
- PRs should include a clear description, impacted areas (e.g., `app/`, `components/`), and screenshots for UI changes.
- Link relevant issues or tickets when applicable.

## Configuration & Secrets
- Service integrations (Supabase, Stripe, Resend) live under `libs/`; configure via environment variables rather than hardcoding.
- Keep `.env*` files out of version control unless explicitly intended.
