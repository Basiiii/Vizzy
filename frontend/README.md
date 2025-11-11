# Vizzy Frontend (Archived)

> Next.js client powering Vizzy's marketplace experience.

## Overview

This folder contains the source for Vizzy's user-facing web application. The deployment is retired, but the code remains as a reference implementation of our capstone UI.

## Structure

```
vizzy/                 # Next.js 15 application
├── app/               # App Router pages, layouts, and server components
├── components/        # Shared UI primitives
├── lib/               # API clients, services, utilities
└── public/            # Static assets
```

## Highlights

* Server-rendered marketplace flows with authenticated dashboards.
* Localization, theming, and accessibility baked into the component system.
* Tight integration with Supabase-backed APIs for listings, messaging, and rentals.

## Getting Started

1. Install dependencies and run the dev server from the repo root:
   ```bash
   npm install
   npm run dev
   ```
2. Or work directly in this package:
   ```bash
   npm install --prefix vizzy
   npm run dev --prefix vizzy
   ```
3. See [`vizzy/README.md`](vizzy/README.md) for deeper details on scripts, tech stack, and environment configuration.
