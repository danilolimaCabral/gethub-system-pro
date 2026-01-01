import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema.ts";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL não configurada");
  process.exit(1);
}

async function addMoreData() {
  console.log("🌱 Adicionando mais dados de teste (últimos 6 meses)...\n");

  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  try {
    // Buscar tenant existente
    const tenants = await db.select().from(schema.tenants).limit(1);
    if (tenants.length === 0) {
      console.error("❌ Nenhum tenant encontrado! Execute o seed primeiro.");
      process.exit(1);
    }
    const tenantId = tenants[0].id;
    console.log(`✅ Tenant encontrado: ${tenants[0].name} (ID: ${tenantId})\n`);

    // Buscar categorias existentes
    const categories = await db.select().from(schema.categories).where(eq(schema.categories.tenantId, tenantId));
    if (categories.length === 0) {
      console.error("❌ Nenhuma categoria encontrada!");
      process.exit(1);
    }
    console.log(`✅ ${categories.length} categorias encontradas\n`);

    // Gerar mais registros de caixa (últimos 6 meses)
    console.log("💰 Adicionando registros de caixa (últimos 6 meses)...");
    const today = new Date();
    let totalAdded = 0;

    for (let monthOffset = 6; monthOffset >= 1; monthOffset--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - monthOffset + 1, 0);
      const daysInMonth = monthEnd.getDate();

      console.log(`  Mês: ${monthStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`);

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
        
        const opening = 100000 + (monthOffset * 50000) + (day * 1000);
        const inflow = 15000 + Math.random() * 20000;
        const outflow = 8000 + Math.random() * 10000;
        const closing = opening + inflow - outflow;
        const variation = ((closing - opening) / opening) * 100;

        await db.insert(schema.cashFlow).values({
          tenantId,
          date,
          openingBalance: opening.toFixed(2),
          inflow: inflow.toFixed(2),
          outflow: outflow.toFixed(2),
          closingBalance: closing.toFixed(2),
          variation: variation.toFixed(2),
          notes: `Movimentação do dia ${date.toLocaleDateString('pt-BR')}`,
        });
        totalAdded++;
      }
    }
    console.log(`  ✓ ${totalAdded} registros de caixa adicionados\n`);

    // Adicionar mais recebíveis (distribuídos nos últimos 6 meses)
    console.log("📈 Adicionando mais recebíveis...");
    let receivablesAdded = 0;
    
    for (let i = 0; i < 50; i++) {
      const daysOffset = -180 + Math.floor(Math.random() * 210); // -180 a +30 dias
      const date = new Date();
      date.setDate(date.getDate() + daysOffset);
      
      const isPast = date < today;
      const status = isPast ? (Math.random() > 0.3 ? "Recebido" : "Atrasado") : "Previsto";
      
      await db.insert(schema.receivables).values({
        tenantId,
        referenceId: `REC-${String(1000 + i).padStart(4, '0')}`,
        customerName: i % 3 === 0 ? "Cliente Atacado" : (i % 3 === 1 ? "Mercado Livre" : "Shopee"),
        channel: i % 3 === 0 ? "Atacado" : (i % 3 === 1 ? "Mercado Livre" : "Shopee"),
        accountCode: i % 3 === 0 ? "CNPJ01" : (i % 3 === 1 ? "ML_CONTA1" : "SHOPEE01"),
        amount: (10000 + Math.random() * 30000).toFixed(2),
        expectedDate: date,
        receivedDate: status === "Recebido" ? date : null,
        status,
        daysOverdue: status === "Atrasado" ? Math.floor(Math.random() * 30) : 0,
        type: i % 3 === 0 ? "CARTEIRA 7 DIAS" : "MARKETPLACE",
        notes: `Venda ${1000 + i}`,
      });
      receivablesAdded++;
    }
    console.log(`  ✓ ${receivablesAdded} recebíveis adicionados\n`);

    // Adicionar mais pagáveis (distribuídos nos últimos 6 meses)
    console.log("📉 Adicionando mais pagáveis...");
    let payablesAdded = 0;
    
    const expenseCategories = categories.filter(c => c.type === "FIXO" || c.type === "VARIÁVEL");
    
    for (let i = 0; i < 40; i++) {
      const daysOffset = -180 + Math.floor(Math.random() * 210); // -180 a +30 dias
      const date = new Date();
      date.setDate(date.getDate() + daysOffset);
      
      const isPast = date < today;
      const status = isPast ? (Math.random() > 0.2 ? "Pago" : "Vencido") : "Aberto";
      
      const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      
      await db.insert(schema.payables).values({
        tenantId,
        referenceId: `PAG-${String(1000 + i).padStart(4, '0')}`,
        beneficiary: i % 2 === 0 ? "Fornecedor ABC" : "Distribuidora XYZ",
        category: category.name,
        costCenter: i % 2 === 0 ? "Atacado" : "Marketplace",
        amount: (3000 + Math.random() * 12000).toFixed(2),
        dueDate: date,
        paymentDate: status === "Pago" ? date : null,
        status,
        paymentMethod: i % 3 === 0 ? "PIX" : (i % 3 === 1 ? "Boleto" : "Transferência"),
        costType: category.type,
        channel: i % 2 === 0 ? "Atacado" : "Marketplace",
        notes: `Pagamento ${1000 + i}`,
      });
      payablesAdded++;
    }
    console.log(`  ✓ ${payablesAdded} pagáveis adicionados\n`);

    console.log("✅ Dados adicionados com sucesso!");
    console.log(`\n📊 Resumo:`);
    console.log(`   - Registros de Caixa: ${totalAdded}`);
    console.log(`   - Recebíveis: ${receivablesAdded}`);
    console.log(`   - Pagáveis: ${payablesAdded}`);

  } catch (error) {
    console.error("❌ Erro ao adicionar dados:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

addMoreData();
