# Vizzy

> Archived full-stack marketplace elevating local buying, selling, trading, and renting for a more circular economy.

## Project Status

This repository is now archived. The production deployment has been shut down, but the codebase remains a reference for our team project that combined user-centric design with a scalable architecture.

## Overview

Vizzy connected neighbourhoods through a community marketplace that balanced affordability with sustainability. We designed the experience for fast browsing, secure transactions, and trustworthy user interactions while keeping the platform simple enough to operate in multiple cities.

## Demo

<a href="https://www.youtube.com/watch?v=kX9aLe1Q8YQ" target="_blank">
  <img src="https://img.youtube.com/vi/kX9aLe1Q8YQ/hqdefault.jpg" alt="Vizzy product trailer" width="640" />
</a>

## Architecture at a Glance

The system is structured as a modern TypeScript monorepo:

* **Frontend** – Next.js (App Router) with Tailwind CSS, Radix UI, and server-side rendering for SEO-friendly browsing and dynamic, internationalized layouts.
* **Backend** – NestJS service exposing a REST API with Swagger documentation, JWT-based authentication, input validation via Zod, and background processing with queues and schedulers.
* **Data & Auth** – Supabase handled Postgres storage, role-based access, and token verification. Redis was introduced for caching, throttling, and session workflows to keep responses low-latency.
* **Infrastructure** – Deployed as containerized services with environment-driven configuration and centralized logging through Winston.

## Highlights

* End-to-end marketplace flows: listings, wishlists, offers, rentals, and messaging.
* Secure auth lifecycle with Supabase-issued JWTs, refresh tokens, and access revocation hooks.
* Redis-backed caching, rate limiting, and job queues to support surges in local demand.
* Media uploads with image processing pipelines for responsive asset delivery.
* City-aware search, filtering, and localization powered by geocoding APIs.
* Accessibility-first UI with component primitives tested across themes and devices.

## Tech Stack

| Layer      | Technologies |
| ---------- | ------------ |
| Frontend   | Next.js 15, React 19, Tailwind CSS 4, Radix UI, React Hook Form, Zod |
| Backend    | NestJS 11, Express 5, Supabase SDK, ioredis, Swagger, Winston |
| Tooling    | TypeScript 5, ESLint 9, Prettier, TurboPack dev server |
| Data & Ops | Supabase (Postgres + Auth), Redis, Nodemailer, Geocoding APIs |

## Quality & Testing

* Automated unit, integration, and end-to-end suites via Jest with coverage tracking.
* Dedicated performance and load testing against key endpoints to validate Redis caching benefits.
* Linting, type checking, and format enforcement wired into CI to keep pull requests healthy.
* GitHub Actions workflows gate pull requests with linting, test runs, and coverage reporting.

## Getting Started Locally

> The hosted instance is no longer active. To explore the project, run it locally.

1. **Requirements** – Node.js 20+, npm, Redis (local or cloud), Supabase project credentials.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment** – Copy the variables from [`backend/vizzy-backend/README.md`](backend/vizzy-backend/README.md) into a `.env` file and supply your Supabase, Redis, and SMTP secrets.
4. **Start the stack**:
   ```bash
   npm run dev
   ```
   This runs the Next.js frontend and NestJS backend concurrently.

## Repository Structure

```
├── frontend/
│   ├── vizzy/                # Next.js application
│   └── README.md             # Frontend-specific setup notes
├── backend/
│   ├── vizzy-backend/        # NestJS API service
│   └── README.md             # Backend environment and API docs
├── package.json              # Monorepo scripts to run both services
└── README.md                 # You are here
```

## Core Contributors

- [Enrique George Rodrigues](https://github.com/Basiiii)
- [José António da Cunha Alves](https://github.com/zealves99)
- [Diogo Araujo Machado](https://github.com/DiogoMachado04)
