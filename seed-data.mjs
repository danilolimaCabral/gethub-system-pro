import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL não configurada");
  process.exit(1);
}

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  try {
    // Criar tenant de exemplo
    console.log("Criando tenant de exemplo...");
    const tenantResult = await db.insert(schema.tenants).values({
      name: "Empresa Demonstração",
      slug: "demo",
      ownerId: 1,
      active: true,
    });

    const tenantId = Number(tenantResult[0].insertId);
    console.log(`✓ Tenant criado com ID: ${tenantId}`);

    // Parâmetros do sistema
    console.log("Criando parâmetros do sistema...");
    await db.insert(schema.systemParameters).values({
      tenantId,
      minCashBalance: "50000.00",
      minRunwayDays: 30,
      maxMarketplaceLockedPercent: "30.00",
      maxOverdueReceivablesPercent: "10.00",
      maxOverduePayablesAmount: "10000.00",
      minGrossMarginPercent: "25.00",
      negativeProjectionAlertDays: 7,
    });
    console.log("✓ Parâmetros criados");

    // Empresas/Contas
    console.log("Criando empresas...");
    await db.insert(schema.companies).values([
      {
        tenantId,
        code: "CNPJ01",
        name: "Empresa Principal Ltda",
        cnpj: "12.345.678/0001-90",
        taxRegime: "Simples Nacional",
        currentBalance: "50000.00",
        bankAccount: "Banco X - CC 12345",
        responsible: "João Silva",
        active: true,
      },
      {
        tenantId,
        code: "CNPJ02",
        name: "Filial Marketplace",
        cnpj: "12.345.678/0002-71",
        taxRegime: "Simples Nacional",
        currentBalance: "30000.00",
        bankAccount: "Banco Y - CC 67890",
        responsible: "Maria Santos",
        active: true,
      },
    ]);
    console.log("✓ Empresas criadas");

    // Categorias
    console.log("Criando categorias...");
    await db.insert(schema.categories).values([
      { tenantId, name: "Salários", type: "FIXO", group: "Folha de Pagamento", active: true },
      { tenantId, name: "Pró-labore", type: "FIXO", group: "Folha de Pagamento", active: true },
      { tenantId, name: "Aluguel", type: "FIXO", group: "Infraestrutura", active: true },
      { tenantId, name: "Energia", type: "FIXO", group: "Infraestrutura", active: true },
      { tenantId, name: "Internet", type: "FIXO", group: "Infraestrutura", active: true },
      { tenantId, name: "Sistemas/Software", type: "FIXO", group: "Tecnologia", active: true },
      { tenantId, name: "Contabilidade", type: "FIXO", group: "Serviços", active: true },
      { tenantId, name: "Compra de Mercadoria (CMV)", type: "VARIÁVEL", group: "CMV", active: true },
      { tenantId, name: "Frete Marketplace", type: "VARIÁVEL", group: "Logística", active: true },
      { tenantId, name: "Taxas Marketplace", type: "VARIÁVEL", group: "Taxas", active: true },
      { tenantId, name: "Embalagens", type: "VARIÁVEL", group: "Logística", active: true },
      { tenantId, name: "Marketing", type: "VARIÁVEL", group: "Marketing", active: true },
      { tenantId, name: "Impostos sobre Venda", type: "VARIÁVEL", group: "Impostos", active: true },
    ]);
    console.log("✓ Categorias criadas");

    // Marketplaces
    console.log("Criando marketplaces...");
    await db.insert(schema.marketplaces).values([
      { tenantId, code: "ML", name: "Mercado Livre", averageFee: "16.00", releaseDelay: 14, linkedAccountCode: "ML_CONTA1", active: true },
      { tenantId, code: "SHOPEE", name: "Shopee", averageFee: "20.00", releaseDelay: 7, linkedAccountCode: "SHOPEE01", active: true },
      { tenantId, code: "AMAZON", name: "Amazon", averageFee: "15.00", releaseDelay: 14, linkedAccountCode: "AMAZON01", active: true },
      { tenantId, code: "MAGALU", name: "Magazine Luiza", averageFee: "18.00", releaseDelay: 30, linkedAccountCode: "MAGALU01", active: true },
      { tenantId, code: "ATACADO", name: "Atacado Direto", averageFee: "0.00", releaseDelay: 7, linkedAccountCode: "CNPJ01", active: true },
    ]);
    console.log("✓ Marketplaces criados");

    // Fornecedores
    console.log("Criando fornecedores...");
    await db.insert(schema.suppliers).values([
      { tenantId, name: "Fornecedor ABC Ltda", cnpj: "11.222.333/0001-44", contact: "Carlos", email: "carlos@abc.com", phone: "(11) 98765-4321", active: true },
      { tenantId, name: "Distribuidora XYZ", cnpj: "22.333.444/0001-55", contact: "Ana", email: "ana@xyz.com", phone: "(11) 97654-3210", active: true },
      { tenantId, name: "Importadora Global", cnpj: "33.444.555/0001-66", contact: "Roberto", email: "roberto@global.com", phone: "(11) 96543-2109", active: true },
    ]);
    console.log("✓ Fornecedores criados");

    // Clientes
    console.log("Criando clientes...");
    await db.insert(schema.customers).values([
      { tenantId, name: "Cliente Atacado Premium", document: "44.555.666/0001-77", contact: "Pedro", email: "pedro@premium.com", phone: "(11) 95432-1098", active: true },
      { tenantId, name: "Loja Parceira Sul", document: "55.666.777/0001-88", contact: "Julia", email: "julia@lojasul.com", phone: "(11) 94321-0987", active: true },
      { tenantId, name: "Rede Varejo Norte", document: "66.777.888/0001-99", contact: "Marcos", email: "marcos@redenorte.com", phone: "(11) 93210-9876", active: true },
    ]);
    console.log("✓ Clientes criados");

    // Produtos
    console.log("Criando produtos...");
    const products = [
      { name: "Notebook Dell Inspiron 15", category: "Informática", costPrice: "2500.00", salePrice: "3500.00", stock: 15 },
      { name: "Mouse Logitech MX Master 3", category: "Periféricos", costPrice: "350.00", salePrice: "550.00", stock: 50 },
      { name: "Teclado Mecânico Keychron K2", category: "Periféricos", costPrice: "450.00", salePrice: "750.00", stock: 30 },
      { name: "Monitor LG 27 4K", category: "Monitores", costPrice: "1200.00", salePrice: "1800.00", stock: 20 },
      { name: "Webcam Logitech C920", category: "Periféricos", costPrice: "250.00", salePrice: "450.00", stock: 40 },
      { name: "Headset HyperX Cloud II", category: "Áudio", costPrice: "300.00", salePrice: "500.00", stock: 35 },
      { name: "SSD Samsung 1TB", category: "Armazenamento", costPrice: "400.00", salePrice: "650.00", stock: 60 },
      { name: "Memória RAM 16GB DDR4", category: "Componentes", costPrice: "280.00", salePrice: "450.00", stock: 45 },
      { name: "Placa de Vídeo RTX 3060", category: "Componentes", costPrice: "2000.00", salePrice: "3200.00", stock: 8 },
      { name: "Cadeira Gamer DXRacer", category: "Móveis", costPrice: "800.00", salePrice: "1400.00", stock: 12 },
      { name: "Mesa Gamer RGB", category: "Móveis", costPrice: "600.00", salePrice: "1100.00", stock: 10 },
      { name: "Mousepad Grande RGB", category: "Acessórios", costPrice: "80.00", salePrice: "150.00", stock: 100 },
      { name: "Hub USB-C 7 Portas", category: "Acessórios", costPrice: "120.00", salePrice: "220.00", stock: 55 },
      { name: "Cabo HDMI 2.1 3m", category: "Cabos", costPrice: "40.00", salePrice: "80.00", stock: 150 },
      { name: "Suporte para Notebook", category: "Acessórios", costPrice: "60.00", salePrice: "120.00", stock: 70 },
    ];

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      await db.insert(schema.products).values({
        tenantId,
        sku: `PROD-${String(i + 1).padStart(4, '0')}`,
        name: p.name,
        description: `Descrição do produto ${p.name}`,
        category: p.category,
        costPrice: p.costPrice,
        salePrice: p.salePrice,
        currentStock: p.stock,
        minStock: Math.floor(p.stock * 0.2),
        active: true,
      });
    }
    console.log(`✓ ${products.length} produtos criados`);

    // Fluxo de Caixa
    console.log("Criando registros de fluxo de caixa...");
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(lastMonth);
      date.setDate(date.getDate() + i);
      
      const opening = i === 0 ? 100000 : 100000 + (i * 20000);
      const inflow = 25000 + Math.random() * 10000;
      const outflow = 5000 + Math.random() * 5000;
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
    }
    console.log("✓ Registros de caixa criados");

    // Recebíveis
    console.log("Criando recebíveis...");
    for (let i = 0; i < 20; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i - 10);
      
      const isPast = date < today;
      const status = isPast ? "Recebido" : "Previsto";
      
      await db.insert(schema.receivables).values({
        tenantId,
        referenceId: `REC-${String(i + 1).padStart(4, '0')}`,
        customerName: i % 2 === 0 ? "Cliente Atacado" : "Mercado Livre",
        channel: i % 2 === 0 ? "Atacado" : "Mercado Livre",
        accountCode: i % 2 === 0 ? "CNPJ01" : "ML_CONTA1",
        amount: (20000 + Math.random() * 10000).toFixed(2),
        expectedDate: date,
        receivedDate: isPast ? date : null,
        status,
        daysOverdue: 0,
        type: i % 2 === 0 ? "CARTEIRA 7 DIAS" : "MARKETPLACE",
        notes: `Venda ${i + 1}`,
      });
    }
    console.log("✓ Recebíveis criados");

    // Pagáveis
    console.log("Criando pagáveis...");
    for (let i = 0; i < 20; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i - 10);
      
      const isPast = date < today;
      const status = isPast ? "Pago" : "Aberto";
      
      await db.insert(schema.payables).values({
        tenantId,
        referenceId: `PAG-${String(i + 1).padStart(4, '0')}`,
        beneficiary: "Fornecedor",
        category: "Compra de Mercadoria (CMV)",
        costCenter: "Atacado",
        amount: (5000 + Math.random() * 3000).toFixed(2),
        dueDate: date,
        paymentDate: isPast ? date : null,
        status,
        paymentMethod: "PIX",
        costType: "VARIÁVEL",
        channel: "Atacado",
        notes: `Pagamento ${i + 1}`,
      });
    }
    console.log("✓ Pagáveis criados");

    console.log("\n✅ Seed concluído com sucesso!");
    console.log(`\n📊 Resumo:`);
    console.log(`   - Tenant: demo`);
    console.log(`   - Empresas: 2`);
    console.log(`   - Categorias: 13`);
    console.log(`   - Marketplaces: 5`);
    console.log(`   - Fornecedores: 3`);
    console.log(`   - Clientes: 3`);
    console.log(`   - Produtos: ${products.length}`);
    console.log(`   - Registros de Caixa: 30`);
    console.log(`   - Recebíveis: 20`);
    console.log(`   - Pagáveis: 20`);

  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
