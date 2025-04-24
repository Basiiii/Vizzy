export function setupCors(app) {
  // TODO: Change to allow only the frontend URL
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
}
