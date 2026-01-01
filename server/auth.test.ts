import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';
import bcrypt from 'bcryptjs';

describe('Auth Endpoints', () => {
  let testUserId: number;
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test@123';
  const testName = 'Test User';

  beforeAll(async () => {
    // Criar usuário de teste
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    testUserId = await db.createUser({
      email: testEmail,
      password: hashedPassword,
      name: testName,
      role: 'user',
    });
  });

  afterAll(async () => {
    // Limpar usuário de teste
    const database = await db.getDb();
    if (database && testUserId) {
      await database.delete(db.users).where(db.eq(db.users.id, testUserId));
    }
  });

  describe('auth.login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const caller = appRouter.createCaller({ user: null });
      
      const result = await caller.auth.login({
        email: testEmail,
        password: testPassword,
      });

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(testEmail);
      expect(result.user.name).toBe(testName);
      expect(result.user.role).toBe('user');
    });

    it('deve falhar com email inválido', async () => {
      const caller = appRouter.createCaller({ user: null });
      
      await expect(
        caller.auth.login({
          email: 'invalido@example.com',
          password: testPassword,
        })
      ).rejects.toThrow();
    });

    it('deve falhar com senha inválida', async () => {
      const caller = appRouter.createCaller({ user: null });
      
      await expect(
        caller.auth.login({
          email: testEmail,
          password: 'senhaErrada',
        })
      ).rejects.toThrow();
    });
  });

  describe('auth.register', () => {
    it('deve registrar novo usuário', async () => {
      const caller = appRouter.createCaller({ user: null });
      const newEmail = `new-${Date.now()}@example.com`;
      
      const result = await caller.auth.register({
        email: newEmail,
        password: 'NewPass@123',
        name: 'New User',
      });

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(newEmail);
      expect(result.user.name).toBe('New User');

      // Limpar
      const database = await db.getDb();
      if (database) {
        await database.delete(db.users).where(db.eq(db.users.email, newEmail));
      }
    });

    it('deve falhar ao registrar com email duplicado', async () => {
      const caller = appRouter.createCaller({ user: null });
      
      await expect(
        caller.auth.register({
          email: testEmail,
          password: 'AnyPass@123',
          name: 'Duplicate User',
        })
      ).rejects.toThrow();
    });
  });

  describe('auth.me', () => {
    it('deve retornar usuário autenticado', async () => {
      const user = await db.getUserById(testUserId);
      const caller = appRouter.createCaller({ user });
      
      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result.id).toBe(testUserId);
      expect(result.email).toBe(testEmail);
    });

    it('deve retornar null para usuário não autenticado', async () => {
      const caller = appRouter.createCaller({ user: null });
      
      const result = await caller.auth.me();

      expect(result).toBeNull();
    });
  });

  describe('auth.updateProfile', () => {
    it('deve atualizar nome do usuário', async () => {
      const user = await db.getUserById(testUserId);
      const caller = appRouter.createCaller({ user });
      const newName = 'Updated Name';
      
      await caller.auth.updateProfile({
        name: newName,
      });

      const updated = await db.getUserById(testUserId);
      expect(updated?.name).toBe(newName);
    });

    it('deve atualizar email do usuário', async () => {
      const user = await db.getUserById(testUserId);
      const caller = appRouter.createCaller({ user });
      const newEmail = `updated-${Date.now()}@example.com`;
      
      await caller.auth.updateProfile({
        email: newEmail,
      });

      const updated = await db.getUserById(testUserId);
      expect(updated?.email).toBe(newEmail);

      // Restaurar email original
      await db.updateUser(testUserId, { email: testEmail });
    });

    it('deve falhar se usuário não autenticado', async () => {
      const caller = appRouter.createCaller({ user: null });
      
      await expect(
        caller.auth.updateProfile({
          name: 'New Name',
        })
      ).rejects.toThrow();
    });
  });

  describe('auth.updatePassword', () => {
    it('deve atualizar senha com senha atual correta', async () => {
      const user = await db.getUserById(testUserId);
      const caller = appRouter.createCaller({ user });
      const newPassword = 'NewPass@456';
      
      await caller.auth.updatePassword({
        currentPassword: testPassword,
        newPassword,
      });

      // Verificar que a nova senha funciona
      const loginCaller = appRouter.createCaller({ user: null });
      const result = await loginCaller.auth.login({
        email: testEmail,
        password: newPassword,
      });

      expect(result).toBeDefined();
      expect(result.user.email).toBe(testEmail);

      // Restaurar senha original
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      await db.updateUserPassword(testUserId, hashedPassword);
    });

    it('deve falhar com senha atual incorreta', async () => {
      const user = await db.getUserById(testUserId);
      const caller = appRouter.createCaller({ user });
      
      await expect(
        caller.auth.updatePassword({
          currentPassword: 'senhaErrada',
          newPassword: 'NewPass@789',
        })
      ).rejects.toThrow();
    });

    it('deve falhar se usuário não autenticado', async () => {
      const caller = appRouter.createCaller({ user: null });
      
      await expect(
        caller.auth.updatePassword({
          currentPassword: testPassword,
          newPassword: 'NewPass@999',
        })
      ).rejects.toThrow();
    });
  });

  describe('auth.logout', () => {
    it('deve fazer logout com sucesso', async () => {
      const user = await db.getUserById(testUserId);
      const caller = appRouter.createCaller({ user });
      
      const result = await caller.auth.logout();

      expect(result).toEqual({ success: true });
    });
  });
});
