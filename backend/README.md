# Vizzy Backend (Archived)

> Service layer responsible for Vizzy's API, authentication, and integrations.

## Overview

The backend folder hosts the NestJS code that powered the Vizzy marketplace. Although the deployment has been shut down, the implementation is preserved for reference during future portfolio reviews or case studies.

## Structure

```
vizzy-backend/         # NestJS 11 service with modules for auth, marketplace, messaging, etc.
└── README.md          # Detailed setup instructions, environment variables, and testing guides
```

## Highlights

* Supabase-backed JWT auth with role-aware guards and refresh token flows.
* Redis caching, throttling, and job queues to keep responses fast under load.
* Swagger docs exposed at `/api` for rapid iteration with frontend and QA teams.

## Getting Started

To boot the backend locally:

1. Install dependencies from this directory:
   ```bash
   npm install --prefix vizzy-backend
   ```
2. Copy the environment template from `vizzy-backend/README.md` and fill in Supabase, Redis, SMTP, and geocoding credentials.
3. Start the service:
   ```bash
   npm run start:dev --prefix vizzy-backend
   ```

Refer to [`vizzy-backend/README.md`](vizzy-backend/README.md) for the full breakdown of modules, scripts, and test suites.
