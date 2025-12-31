import { drizzle } from "drizzle-orm/mysql2";
import { users } from "./drizzle/schema.ts";
import bcrypt from "bcryptjs";

const db = drizzle(process.env.DATABASE_URL);

async function createUsers() {
  console.log("Criando usuários de teste...");

  // Hash das senhas
  const adminPassword = await bcrypt.hash("Admin@2025", 10);
  const testPassword = await bcrypt.hash("Teste@123", 10);

  // Admin Master
  await db.insert(users).values({
    openId: "admin-master-001",
    name: "Admin Master",
    email: "admin@erpfinanceiro.com",
    password: adminPassword,
    role: "admin",
    loginMethod: "local",
  }).onDuplicateKeyUpdate({
    set: { password: adminPassword }
  });

  console.log("✅ Admin Master criado: admin@erpfinanceiro.com / Admin@2025");

  // Usuário de Teste
  await db.insert(users).values({
    openId: "user-test-001",
    name: "Usuário Teste",
    email: "teste@empresa.com",
    password: testPassword,
    role: "user",
    loginMethod: "local",
  }).onDuplicateKeyUpdate({
    set: { password: testPassword }
  });

  console.log("✅ Usuário Teste criado: teste@empresa.com / Teste@123");
  console.log("\n🎉 Usuários criados com sucesso!");
}

createUsers().catch(console.error);
