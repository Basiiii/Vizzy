# Vizzy - Community Sharing Platform

Vizzy is a community platform designed to facilitate buying, selling, trading, and renting items between people in the same community, promoting a practical, economical, and sustainable way to share resources. Through Vizzy, users can acquire second-hand products, exchange items, or even rent tools and other equipment.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Objective

The platform aims to create a sharing network within a community where members can benefit from more conscious consumption, saving money and resources while promoting sustainability and cooperation.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Application routes and pages using Next.js App Router
- `components/` - Reusable UI components
- `lib/` - Utility functions and services
  - `api/` - API client functions
  - `constants/` - Application constants
  - `services/` - Service functions
  - `utils/` - Utility functions

## Features

- Authentication and user management
- Dashboard with data visualization
- Contact management
- Internationalization with next-intl
- Theme support with next-themes

## Scripts

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server on port 4000
- `npm run lint` - Run ESLint to check code quality

## Technologies

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Shadcn UI
- Recharts for data visualization
- Zod for schema validation
- React Hook Form for form handling
