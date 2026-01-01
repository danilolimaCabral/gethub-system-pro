import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';

describe('Permissions Endpoints', () => {
  let adminUserId: number;
  let regularUserId: number;
  let testTenantId: number;

  beforeAll(async () => {
    // Criar usuário admin
    adminUserId = await db.createUser({
      email: `admin-perm-${Date.now()}@example.com`,
      password: 'hashedpassword',
      name: 'Admin User',
      role: 'admin',
      permissions: ['dashboard', 'caixa', 'recebiveis', 'pagaveis', 'cadastros', 'dre', 'usuarios'],
    });

    // Criar usuário regular
    regularUserId = await db.createUser({
      email: `user-perm-${Date.now()}@example.com`,
      password: 'hashedpassword',
      name: 'Regular User',
      role: 'user',
      permissions: ['dashboard', 'caixa'],
    });

    // Criar tenant
    testTenantId = await db.createTenant({
      name: 'Test Tenant Permissions',
      slug: `test-perm-${Date.now()}`,
      ownerId: adminUserId,
    });

    await db.addUserToTenant(adminUserId, testTenantId);
    await db.addUserToTenant(regularUserId, testTenantId);
  });

  afterAll(async () => {
    // Limpar dados de teste
    const database = await db.getDb();
    if (database) {
      await database.delete(db.tenantUsers).where(db.eq(db.tenantUsers.tenantId, testTenantId));
      await database.delete(db.tenants).where(db.eq(db.tenants.id, testTenantId));
      await database.delete(db.users).where(db.eq(db.users.id, adminUserId));
      await database.delete(db.users).where(db.eq(db.users.id, regularUserId));
    }
  });

  describe('user.listAll', () => {
    it('deve listar todos os usuários para admin', async () => {
      const admin = await db.getUserById(adminUserId);
      const caller = appRouter.createCaller({ user: admin, tenantId: testTenantId });

      const result = await caller.user.listAll();

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThanOrEqual(2);
      
      // Verificar estrutura
      result.forEach((user) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('role');
        expect(user).toHaveProperty('permissions');
      });
    });

    it('deve falhar para usuário não-admin', async () => {
      const user = await db.getUserById(regularUserId);
      const caller = appRouter.createCaller({ user, tenantId: testTenantId });

      await expect(
        caller.user.listAll()
      ).rejects.toThrow();
    });

    it('deve falhar se usuário não autenticado', async () => {
      const caller = appRouter.createCaller({ user: null, tenantId: testTenantId });

      await expect(
        caller.user.listAll()
      ).rejects.toThrow();
    });
  });

  describe('user.getPermissions', () => {
    it('deve retornar permissões do usuário', async () => {
      const user = await db.getUserById(regularUserId);
      const caller = appRouter.createCaller({ user, tenantId: testTenantId });

      const result = await caller.user.getPermissions({ userId: regularUserId });

      expect(result).toBeDefined();
      expect(result.permissions).toBeInstanceOf(Array);
      expect(result.permissions).toContain('dashboard');
      expect(result.permissions).toContain('caixa');
      expect(result.permissions).not.toContain('usuarios');
    });

    it('deve retornar permissões vazias se usuário não tem permissões', async () => {
      // Criar usuário sem permissões
      const noPermUserId = await db.createUser({
        email: `no-perm-${Date.now()}@example.com`,
        password: 'hashedpassword',
        name: 'No Perm User',
        role: 'user',
      });

      const user = await db.getUserById(noPermUserId);
      const caller = appRouter.createCaller({ user, tenantId: testTenantId });

      const result = await caller.user.getPermissions({ userId: noPermUserId });

      expect(result).toBeDefined();
      expect(result.permissions).toBeInstanceOf(Array);
      expect(result.permissions.length).toBe(0);

      // Limpar
      const database = await db.getDb();
      if (database) {
        await database.delete(db.users).where(db.eq(db.users.id, noPermUserId));
      }
    });

    it('deve falhar se usuário não autenticado', async () => {
      const caller = appRouter.createCaller({ user: null, tenantId: testTenantId });

      await expect(
        caller.user.getPermissions({ userId: regularUserId })
      ).rejects.toThrow();
    });
  });

  describe('user.updatePermissions', () => {
    it('deve atualizar permissões de usuário (admin)', async () => {
      const admin = await db.getUserById(adminUserId);
      const caller = appRouter.createCaller({ user: admin, tenantId: testTenantId });

      const newPermissions = ['dashboard', 'caixa', 'recebiveis', 'dre'];

      await caller.user.updatePermissions({
        userId: regularUserId,
        permissions: newPermissions,
      });

      const updated = await db.getUserById(regularUserId);
      expect(updated?.permissions).toEqual(newPermissions);

      // Restaurar permissões originais
      await db.updateUserPermissions(regularUserId, ['dashboard', 'caixa']);
    });

    it('deve permitir remover todas as permissões', async () => {
      const admin = await db.getUserById(adminUserId);
      const caller = appRouter.createCaller({ user: admin, tenantId: testTenantId });

      await caller.user.updatePermissions({
        userId: regularUserId,
        permissions: [],
      });

      const updated = await db.getUserById(regularUserId);
      expect(updated?.permissions).toEqual([]);

      // Restaurar permissões originais
      await db.updateUserPermissions(regularUserId, ['dashboard', 'caixa']);
    });

    it('deve falhar para usuário não-admin', async () => {
      const user = await db.getUserById(regularUserId);
      const caller = appRouter.createCaller({ user, tenantId: testTenantId });

      await expect(
        caller.user.updatePermissions({
          userId: regularUserId,
          permissions: ['dashboard'],
        })
      ).rejects.toThrow();
    });

    it('deve falhar se usuário não autenticado', async () => {
      const caller = appRouter.createCaller({ user: null, tenantId: testTenantId });

      await expect(
        caller.user.updatePermissions({
          userId: regularUserId,
          permissions: ['dashboard'],
        })
      ).rejects.toThrow();
    });

    it('deve falhar se tentar atualizar usuário inexistente', async () => {
      const admin = await db.getUserById(adminUserId);
      const caller = appRouter.createCaller({ user: admin, tenantId: testTenantId });

      await expect(
        caller.user.updatePermissions({
          userId: 999999,
          permissions: ['dashboard'],
        })
      ).rejects.toThrow();
    });
  });

  describe('Verificação de permissões no frontend', () => {
    it('admin deve ter todas as permissões', async () => {
      const admin = await db.getUserById(adminUserId);
      
      expect(admin?.role).toBe('admin');
      expect(admin?.permissions).toContain('dashboard');
      expect(admin?.permissions).toContain('usuarios');
      expect(admin?.permissions).toContain('dre');
    });

    it('usuário regular deve ter apenas permissões específicas', async () => {
      const user = await db.getUserById(regularUserId);
      
      expect(user?.role).toBe('user');
      expect(user?.permissions).toContain('dashboard');
      expect(user?.permissions).toContain('caixa');
      expect(user?.permissions).not.toContain('usuarios');
      expect(user?.permissions).not.toContain('dre');
    });
  });
});
