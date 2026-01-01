import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import type { Request, Response } from "express";
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    email?: string;
    role?: string;
  }
}

export type TrpcContext = {
  req: Request;
  res: Response;
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Verificar se existe sessão ativa
    const session = (opts.req as any).session;
    if (session && session.userId) {
      user = await db.getUserById(session.userId);
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req as Request,
    res: opts.res as Response,
    user,
  };
}
