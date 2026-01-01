import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import type { Request, Response } from "express";

export type TrpcContext = {
  req: Request;
  res: Response;
  user: User;
  tenantId: number;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // Sistema sem autenticação - sempre usa tenant 1 e usuário admin mock
  const user: User = {
    id: 1,
    email: 'admin@erpfinanceiro.com',
    name: 'Administrador',
    role: 'admin' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const tenantId = 1;

  return {
    req: opts.req as Request,
    res: opts.res as Response,
    user,
    tenantId,
  };
}
