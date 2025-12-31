import { drizzle } from "drizzle-orm/mysql2";
import { 
  tenants, companies, categories, marketplaces, suppliers, customers, products,
  cashFlow, receivables, payables, stockMovements
} from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

// Helpers para gerar dados realistas
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomAmount(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function seedMassData() {
  console.log("🚀 Iniciando seed em massa...\n");

  // 1. Criar Tenants
  console.log("📊 Criando 5 tenants/empresas...");
  const tenantNames = [
    "Empresa Alpha Ltda",
    "Beta Comércio SA",
    "Gamma Distribuidora",
    "Delta Serviços",
    "Epsilon Tech"
  ];

  const tenantIds = [];
  for (const name of tenantNames) {
    const result = await db.insert(tenants).values({ name });
    tenantIds.push(result[0].insertId);
  }
  console.log(`✅ ${tenantIds.length} tenants criados\n`);

  // Usar primeiro tenant para os dados
  const tenantId = tenantIds[0];

  // 2. Criar Companies/CNPJs
  console.log("🏢 Criando 8 companies/CNPJs...");
  const companyNames = [
    "Matriz São Paulo", "Filial Rio", "Filial BH", "Filial Curitiba",
    "Loja Centro", "Loja Shopping", "Depósito", "E-commerce"
  ];
  const companyIds = [];
  for (const name of companyNames) {
    const cnpj = `${randomInt(10, 99)}.${randomInt(100, 999)}.${randomInt(100, 999)}/0001-${randomInt(10, 99)}`;
    const result = await db.insert(companies).values({
      tenantId,
      name,
      cnpj,
      type: randomItem(["MATRIZ", "FILIAL", "LOJA"])
    });
    companyIds.push(result[0].insertId);
  }
  console.log(`✅ ${companyIds.length} companies criadas\n`);

  // 3. Criar Categories
  console.log("📁 Criando 25 categorias...");
  const categoryNames = [
    "Vendas Online", "Vendas Loja Física", "Vendas Atacado", "Vendas Varejo",
    "Aluguel", "Salários", "Impostos", "Marketing", "Fornecedores",
    "Energia", "Telefone/Internet", "Manutenção", "Transporte", "Seguros",
    "Consultoria", "Software/Licenças", "Material de Escritório", "Limpeza",
    "Comissões", "Bonificações", "Investimentos", "Empréstimos", "Juros",
    "Taxas Bancárias", "Outros"
  ];
  const categoryIds = [];
  for (const name of categoryNames) {
    const result = await db.insert(categories).values({
      tenantId,
      name,
      type: name.includes("Vendas") || name.includes("Investimentos") ? "RECEITA" : "DESPESA"
    });
    categoryIds.push(result[0].insertId);
  }
  console.log(`✅ ${categoryIds.length} categorias criadas\n`);

  // 4. Criar Marketplaces
  console.log("🛒 Criando 6 marketplaces...");
  const marketplaceNames = [
    "Mercado Livre", "Amazon", "Shopee", "Magazine Luiza", "Americanas", "Site Próprio"
  ];
  const marketplaceIds = [];
  for (const name of marketplaceNames) {
    const result = await db.insert(marketplaces).values({
      tenantId,
      name,
      commission: randomAmount(5, 15)
    });
    marketplaceIds.push(result[0].insertId);
  }
  console.log(`✅ ${marketplaceIds.length} marketplaces criados\n`);

  // 5. Criar Suppliers
  console.log("🏭 Criando 20 fornecedores...");
  const supplierPrefixes = [
    "Distribuidora", "Atacado", "Indústria", "Importadora", "Comercial"
  ];
  const supplierSuffixes = [
    "Silva", "Santos", "Oliveira", "Costa", "Souza", "Lima", "Pereira", "Alves"
  ];
  const supplierIds = [];
  for (let i = 0; i < 20; i++) {
    const name = `${randomItem(supplierPrefixes)} ${randomItem(supplierSuffixes)} ${randomInt(1, 99)}`;
    const result = await db.insert(suppliers).values({
      tenantId,
      name,
      cnpj: `${randomInt(10, 99)}.${randomInt(100, 999)}.${randomInt(100, 999)}/0001-${randomInt(10, 99)}`,
      contact: `contato@${name.toLowerCase().replace(/ /g, '')}.com.br`
    });
    supplierIds.push(result[0].insertId);
  }
  console.log(`✅ ${supplierIds.length} fornecedores criados\n`);

  // 6. Criar Customers
  console.log("👥 Criando 30 clientes...");
  const customerNames = [
    "João Silva", "Maria Santos", "Pedro Oliveira", "Ana Costa", "Carlos Souza",
    "Juliana Lima", "Roberto Pereira", "Fernanda Alves", "Paulo Rodrigues", "Mariana Ferreira",
    "Lucas Martins", "Beatriz Gomes", "Rafael Costa", "Camila Ribeiro", "Felipe Santos",
    "Larissa Oliveira", "Gustavo Lima", "Patrícia Alves", "Thiago Silva", "Amanda Costa",
    "Bruno Santos", "Gabriela Souza", "Diego Pereira", "Isabela Lima", "Rodrigo Alves",
    "Letícia Silva", "Marcelo Costa", "Natália Santos", "Vinícius Oliveira", "Carolina Lima"
  ];
  const customerIds = [];
  for (const name of customerNames) {
    const result = await db.insert(customers).values({
      tenantId,
      name,
      email: `${name.toLowerCase().replace(/ /g, '.')}@email.com`,
      phone: `(${randomInt(11, 99)}) ${randomInt(90000, 99999)}-${randomInt(1000, 9999)}`
    });
    customerIds.push(result[0].insertId);
  }
  console.log(`✅ ${customerIds.length} clientes criados\n`);

  // 7. Criar Products
  console.log("📦 Criando 60 produtos...");
  const productCategories = [
    { prefix: "Notebook", min: 2500, max: 8000 },
    { prefix: "Mouse", min: 30, max: 300 },
    { prefix: "Teclado", min: 80, max: 800 },
    { prefix: "Monitor", min: 600, max: 3000 },
    { prefix: "Webcam", min: 150, max: 1200 },
    { prefix: "Headset", min: 100, max: 1500 },
    { prefix: "Cadeira Gamer", min: 800, max: 3500 },
    { prefix: "Mesa", min: 400, max: 2000 },
    { prefix: "SSD", min: 200, max: 1500 },
    { prefix: "Memória RAM", min: 150, max: 800 },
    { prefix: "Placa de Vídeo", min: 1500, max: 8000 },
    { prefix: "Processador", min: 800, max: 4000 }
  ];
  
  const productIds = [];
  for (let i = 0; i < 60; i++) {
    const cat = randomItem(productCategories);
    const cost = parseFloat(randomAmount(cat.min * 0.6, cat.min * 0.8));
    const price = parseFloat(randomAmount(cat.min, cat.max));
    
    const result = await db.insert(products).values({
      tenantId,
      name: `${cat.prefix} ${randomItem(['Pro', 'Plus', 'Premium', 'Basic', 'Standard'])} ${randomInt(1, 20)}`,
      sku: `SKU-${randomInt(1000, 9999)}`,
      cost: cost.toFixed(2),
      price: price.toFixed(2),
      stock: randomInt(0, 200),
      minStock: randomInt(5, 20)
    });
    productIds.push(result[0].insertId);
  }
  console.log(`✅ ${productIds.length} produtos criados\n`);

  // 8. Criar CashFlow (últimos 6 meses)
  console.log("💰 Criando 150 movimentações de caixa...");
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  const endDate = new Date();

  for (let i = 0; i < 150; i++) {
    const type = Math.random() > 0.4 ? "ENTRADA" : "SAÍDA";
    const amount = type === "ENTRADA" 
      ? randomAmount(500, 15000)
      : randomAmount(200, 8000);
    
    await db.insert(cashFlow).values({
      tenantId,
      date: randomDate(startDate, endDate).toISOString().split('T')[0],
      description: type === "ENTRADA" 
        ? `Venda ${randomItem(['Online', 'Loja', 'Atacado'])} #${randomInt(1000, 9999)}`
        : `Pagamento ${randomItem(['Fornecedor', 'Salário', 'Aluguel', 'Imposto'])} #${randomInt(100, 999)}`,
      amount,
      type,
      categoryId: randomItem(categoryIds)
    });
  }
  console.log(`✅ 150 movimentações de caixa criadas\n`);

  // 9. Criar Receivables
  console.log("📈 Criando 100 recebíveis...");
  const statuses = ["PREVISTO", "RECEBIDO", "ATRASADO"];
  for (let i = 0; i < 100; i++) {
    const dueDate = randomDate(startDate, new Date(Date.now() + 60 * 24 * 60 * 60 * 1000));
    const status = randomItem(statuses);
    const receivedDate = status === "RECEBIDO" 
      ? randomDate(dueDate, new Date()).toISOString().split('T')[0]
      : null;
    
    await db.insert(receivables).values({
      tenantId,
      dueDate: dueDate.toISOString().split('T')[0],
      description: `Venda a prazo #${randomInt(1000, 9999)}`,
      amount: randomAmount(500, 20000),
      status,
      receivedDate,
      customerId: randomItem(customerIds)
    });
  }
  console.log(`✅ 100 recebíveis criados\n`);

  // 10. Criar Payables
  console.log("📉 Criando 80 pagáveis...");
  const payableStatuses = ["ABERTO", "PAGO", "VENCIDO"];
  const costTypes = ["FIXO", "VARIÁVEL"];
  for (let i = 0; i < 80; i++) {
    const dueDate = randomDate(startDate, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    const status = randomItem(payableStatuses);
    const paidDate = status === "PAGO"
      ? randomDate(dueDate, new Date()).toISOString().split('T')[0]
      : null;
    
    await db.insert(payables).values({
      tenantId,
      dueDate: dueDate.toISOString().split('T')[0],
      description: `Conta ${randomItem(['Fornecedor', 'Serviço', 'Imposto', 'Aluguel'])} #${randomInt(100, 999)}`,
      amount: randomAmount(300, 12000),
      status,
      costType: randomItem(costTypes),
      paidDate,
      supplierId: randomItem(supplierIds),
      categoryId: randomItem(categoryIds)
    });
  }
  console.log(`✅ 80 pagáveis criados\n`);

  // 11. Criar Stock Movements
  console.log("📊 Criando 120 movimentações de estoque...");
  const movementTypes = ["ENTRADA", "SAÍDA", "AJUSTE"];
  for (let i = 0; i < 120; i++) {
    const type = randomItem(movementTypes);
    const quantity = type === "SAÍDA" ? randomInt(1, 10) : randomInt(5, 50);
    
    await db.insert(stockMovements).values({
      tenantId,
      productId: randomItem(productIds),
      date: randomDate(startDate, endDate).toISOString().split('T')[0],
      type,
      quantity,
      reason: type === "ENTRADA" 
        ? "Compra de fornecedor"
        : type === "SAÍDA"
        ? "Venda ao cliente"
        : "Ajuste de inventário"
    });
  }
  console.log(`✅ 120 movimentações de estoque criadas\n`);

  console.log("🎉 SEED EM MASSA CONCLUÍDO COM SUCESSO!");
  console.log("\n📊 Resumo:");
  console.log(`   - 5 Tenants`);
  console.log(`   - 8 Companies`);
  console.log(`   - 25 Categorias`);
  console.log(`   - 6 Marketplaces`);
  console.log(`   - 20 Fornecedores`);
  console.log(`   - 30 Clientes`);
  console.log(`   - 60 Produtos`);
  console.log(`   - 150 Movimentações de Caixa`);
  console.log(`   - 100 Recebíveis`);
  console.log(`   - 80 Pagáveis`);
  console.log(`   - 120 Movimentações de Estoque`);
  console.log(`\n   TOTAL: 604 registros criados! 🚀\n`);
}

seedMassData().catch(console.error).finally(() => process.exit(0));
