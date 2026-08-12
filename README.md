# Keepsleeve

Turn any photo into a collectible card.

Upload a photo, pick a style (Aurora, Ember, Noir, Retro Arcade, or Garden), customize colors and text, then download a crisp PNG — or share it from your device.

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
3. Demo URL: `https://<user>.github.io/trading-card-studio/`

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- [`card-foil`](https://github.com/sawyerWeld/card-foil) — TCG-inspired foil / tilt / specular finishes
- [`modern-screenshot`](https://github.com/qq15725/modern-screenshot) — reliable 2× PNG export

## License

MIT
