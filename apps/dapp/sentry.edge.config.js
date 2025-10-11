// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (process.env.NODE_ENV === 'production' && !process.env.SENTRY_IGNORE) {
  Sentry.init({
    dsn:
      SENTRY_DSN ||
      'https://5a20bdd5c3e345748fd1c269ee78e233@o997871.ingest.sentry.io/4504474615021568',
    tracesSampleRate: 1.0,
  });
}
