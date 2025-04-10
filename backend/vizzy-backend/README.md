# Vizzy Backend API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

Vizzy Backend API is built with [NestJS](https://github.com/nestjs/nest), a progressive Node.js framework for building efficient and scalable server-side applications.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
PORT=your-port
FRONTEND_URL=your-frontend-url
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-secret-key
REDIS_HOST=your-redis-host
REDIS_PORT=your-redis-port
REDIS_PASSWORD=your-redis-password
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
GEOCODING_BASE_API_URL=your-geocoding-api-base-url
GEOCODING_API_KEY=your-geocoding-api-key
```

## API Documentation

When running the server, you can access the Swagger API documentation at:

```
http://localhost:5000/api
```
