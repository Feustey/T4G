import pino from "pino";

export const logg = pino({
  level: "trace",
  base: {
    env: process.env.NODE_ENV,
    revision: process.env.VERCEL_GITHUB_COMMIT_SHA,
  },
  // transport: {
  //     target: 'pino-pretty',
  //     options: {
  //         colorize: true
  //     }
  // },
});
