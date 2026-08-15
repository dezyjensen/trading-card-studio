# Keepsleeve

**[Live demo →](https://dezyjensen.github.io/trading-card-studio/)**

Turn any photo into a one-of-one trading card.

Keepsleeve is a browser studio for making collectible-style cards from your own photos. Crop your shot, pick a finish (foil, tilt, specular highlights), customize name/text/colors, preview full screen, save cards to a personal binder, and download or share a crisp PNG to your phone.

The hero carousel shows sample templates you can tap to start from — then edit everything in the studio.

## Demo

Static GitHub Pages build (no sign-in; binder saves stay in your browser via `localStorage`):

**https://dezyjensen.github.io/trading-card-studio/**

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Static demo (GitHub Pages)

Accounts and the Postgres API are behind a feature flag in `lib/features.ts`:

```ts
export const STATIC_DEMO = true; // flip to false for full backend + sign-in
```

When `STATIC_DEMO` is `true`:

- Sign-in / account UI is hidden
- Binder saves use `localStorage` in the browser
- You can ship a static site with no server

### Hero sample images

Carousel cards are static PNGs in `public/hero-samples/`.

To regenerate after changing sample designs (requires `npm run dev` running and Playwright + system Chrome):

```bash
npm run capture:hero
```

The static build writes to `out/` with base path `/trading-card-studio` (for project Pages). Override with `NEXT_PUBLIC_BASE_PATH=` if you host at the domain root.

### Deploy on GitHub Pages

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. Push to `main` (or run the **Deploy static demo to GitHub Pages** workflow manually)
3. Demo: [https://dezyjensen.github.io/trading-card-studio/](https://dezyjensen.github.io/trading-card-studio/)

## Stack & tools

**App**

- [Next.js](https://nextjs.org/) (App Router) + React 19
- TypeScript
- [Tailwind CSS](https://tailwindcss.com/) v4

**Card experience**

- [`card-foil`](https://github.com/sawyerWeld/card-foil) — TCG-inspired foil / tilt / specular finishes
- [`react-easy-crop`](https://github.com/ValentinH/react-easy-crop) — photo crop & zoom
- [`modern-screenshot`](https://github.com/qq15725/modern-screenshot) — reliable 2× PNG export for download / share

**Binder / UI**

- [`@dnd-kit`](https://dndkit.com/) — drag-and-drop binder layout

**Full product mode** (when `STATIC_DEMO` is `false`)

- [Drizzle ORM](https://orm.drizzle.team/) + Postgres — accounts and saved cards
- `bcryptjs` — password hashing

**Tooling**

- Playwright — capture hero sample PNGs (`npm run capture:hero`)
- ESLint + TypeScript — lint and typecheck

## License

MIT
