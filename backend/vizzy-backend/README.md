# Vizzy Backend API (Archived)

> NestJS service powering Vizzy's marketplace workflows, authentication, and integrations.

## Status

The backend is no longer deployed, but the codebase remains as a reference for the architecture and patterns we implemented during the Vizzy project.

## What This Service Handles

* RESTful API for marketplace features: listings, rentals, messaging, and wishlists.
* JWT authentication pipeline backed by Supabase roles and refresh tokens.
* Redis caching for hot queries, rate limiting, and background job orchestration.
* Media uploads with Sharp transformations and secure storage hand-offs.
* Swagger/OpenAPI docs exposed via `/api` for consumers and QA.

## Tech Stack

| Concern     | Tools |
| ----------- | ----- |
| Framework   | NestJS 11, Express 5 |
| Data & Auth | Supabase (Postgres + Auth), Redis |
| Messaging   | Nodemailer SMTP, Geocoding APIs |
| Observability | Winston logger, Nest Throttler |

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Use the template below and copy into `.env` with your Supabase, Redis, and SMTP credentials.
3. Run the server:
   ```bash
   npm run start:dev
   ```
4. Visit `http://localhost:5000/api` for auto-generated Swagger docs.

### Environment Variables

```
PORT=
FRONTEND_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
JWT_SECRET=
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
SMTP_USER=
SMTP_PASSWORD=
GEOCODING_BASE_API_URL=
GEOCODING_API_KEY=
```

## Testing

```bash
# unit tests
npm run test

# integration & e2e suites
npm run test:integration
npm run test:e2e

# coverage report
npm run test:cov
```

## Project Layout

```
src/
├── auth/             # JWT guards, strategies, Supabase integration
├── marketplace/      # Listings, rentals, offers modules
├── messaging/        # Conversations, notifications
├── rate-limit/       # Redis-based throttling
├── common/           # DTOs, interceptors, utils
└── main.ts           # Nest bootstrap
```
