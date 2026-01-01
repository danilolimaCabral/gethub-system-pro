import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as db from './db';
import { ENV } from './_core/env';

const JWT_SECRET = ENV.jwtSecret;
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function registerUser(email: string, password: string, name?: string) {
  // Verificar se usuário já existe
  const existing = await db.getUserByEmail(email);
  if (existing) {
    throw new Error('Email já cadastrado');
  }

  // Hash da senha
  const hashedPassword = await hashPassword(password);

  // Criar usuário
  const userId = await db.createUser({
    email,
    password: hashedPassword,
    name: name || null,
    role: 'user',
  });

  // Gerar token
  const token = generateToken({
    userId,
    email,
    role: 'user',
  });

  return { userId, token };
}

export async function loginUser(email: string, password: string) {
  // Buscar usuário
  const user = await db.getUserByEmail(email);
  if (!user) {
    throw new Error('Email ou senha inválidos');
  }

  // Verificar senha
  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new Error('Email ou senha inválidos');
  }

  // Atualizar último login
  await db.updateUserLastSignIn(user.id);

  // Gerar token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, token };
}

export async function validateToken(token: string) {
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  // Buscar usuário atualizado
  const user = await db.getUserById(payload.userId);
  if (!user) {
    return null;
  }

  return user;
}

export async function updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
  // Buscar usuário
  const user = await db.getUserById(userId);
  if (!user) {
    return false;
  }

  // Verificar senha atual
  const isValid = await comparePassword(currentPassword, user.password);
  if (!isValid) {
    return false;
  }

  // Hash da nova senha
  const hashedPassword = await hashPassword(newPassword);

  // Atualizar senha
  await db.updateUserPassword(userId, hashedPassword);

  return true;
}


// ==================== PASSWORD RESET ====================

import crypto from 'crypto';

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createPasswordResetToken(userId: number): Promise<string> {
  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
  
  const database = await db.getDb();
  if (!database) {
    throw new Error('Database not available');
  }
  
  await database.insert(db.passwordResetTokens).values({
    userId,
    token,
    expiresAt,
    used: false,
  });
  
  return token;
}

export async function validateResetToken(token: string): Promise<number | null> {
  const database = await db.getDb();
  if (!database) {
    return null;
  }
  
  const [resetToken] = await database
    .select()
    .from(db.passwordResetTokens)
    .where(db.eq(db.passwordResetTokens.token, token))
    .limit(1);
  
  if (!resetToken) {
    return null;
  }
  
  // Verificar se já foi usado
  if (resetToken.used) {
    return null;
  }
  
  // Verificar se expirou
  if (new Date() > new Date(resetToken.expiresAt)) {
    return null;
  }
  
  return resetToken.userId;
}

export async function markTokenAsUsed(token: string): Promise<void> {
  const database = await db.getDb();
  if (!database) {
    throw new Error('Database not available');
  }
  
  await database
    .update(db.passwordResetTokens)
    .set({ used: true })
    .where(db.eq(db.passwordResetTokens.token, token));
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const userId = await validateResetToken(token);
  
  if (!userId) {
    return false;
  }
  
  // Hash da nova senha
  const hashedPassword = await hashPassword(newPassword);
  
  // Atualizar senha
  await db.updateUserPassword(userId, hashedPassword);
  
  // Marcar token como usado
  await markTokenAsUsed(token);
  
  return true;
}
