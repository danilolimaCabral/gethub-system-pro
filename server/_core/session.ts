import session from 'express-session';
import { ENV } from './env';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    email?: string;
    role?: string;
  }
}

export const sessionMiddleware = session({
  secret: ENV.cookieSecret || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
    sameSite: 'lax',
  },
});
