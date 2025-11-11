# Vizzy Frontend (Archived)

> Next.js 15 application delivering Vizzy's responsive marketplace experience.

## Status

The hosted frontend has been sunset. The code remains a reference for the UI/UX we crafted during the Vizzy project.

## Highlights

* App Router architecture with server-side rendering and route-level layouts.
* Authenticated dashboards, wishlists, and messaging driven by Supabase tokens.
* Geolocation-aware browse and search flows, localized with `next-intl`.
* Accessible component system built with Radix primitives and themed via `next-themes`.

## Tech Stack

| Concern     | Tools |
| ----------- | ----- |
| Framework   | Next.js 15, React 19 |
| Styling     | Tailwind CSS 4, Radix UI, class-variance-authority |
| Forms       | React Hook Form, Zod |
| Data        | Supabase SSR helpers, custom API client |

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the required environment variables (see `.env.example`) to point at a running backend and Supabase instance.
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000` to explore the app.

## Project Structure

```
app/            # Routes, layouts, server components
components/     # Shared UI building blocks
lib/
├── api/        # REST client helpers
├── constants/  # App-wide constants
├── services/   # Domain services and side effects
└── utils/      # Misc utilities
public/         # Static assets
```

## Scripts

```bash
npm run dev      # Start dev server with Turbopack
npm run build    # Build for production
npm run start    # Run production build (default port 4000)
npm run lint     # ESLint checks
```
