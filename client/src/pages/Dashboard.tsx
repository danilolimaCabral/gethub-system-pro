import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  TrendingUp, TrendingDown, DollarSign, AlertTriangle, 
  Wallet, CreditCard, ArrowUpRight, ArrowDownRight, Loader2 
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { data: cashFlowData, isLoading: loadingCash } = trpc.cashFlow.list.useQuery({});
  const { data: receivablesData, isLoading: loadingReceivables } = trpc.receivable.list.useQuery({});
  const { data: payablesData, isLoading: loadingPayables } = trpc.payable.list.useQuery({});
  const { data: categories } = trpc.category.list.useQuery({});

  const isLoading = loadingCash || loadingReceivables || loadingPayables;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  // Cálculos de KPIs
  const totalEntradas = cashFlowData?.filter(c => c.type === "ENTRADA").reduce((acc, c) => acc + parseFloat(c.amount), 0) || 0;
  const totalSaidas = cashFlowData?.filter(c => c.type === "SAÍDA").reduce((acc, c) => acc + parseFloat(c.amount), 0) || 0;
  const saldoAtual = totalEntradas - totalSaidas;
  const lucro = totalEntradas - totalSaidas;

  const totalRecebiveis = receivablesData?.reduce((acc, r) => acc + parseFloat(r.amount), 0) || 0;
  const recebiveisAtrasados = receivablesData?.filter(r => r.status === "ATRASADO").reduce((acc, r) => acc + parseFloat(r.amount), 0) || 0;
  
  const totalPagaveis = payablesData?.reduce((acc, p) => acc + parseFloat(p.amount), 0) || 0;
  const pagaveisVencidos = payablesData?.filter(p => p.status === "VENCIDO").reduce((acc, p) => acc + parseFloat(p.amount), 0) || 0;

  // Burn Rate (últimos 30 dias)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const saidasUltimos30Dias = cashFlowData?.filter(c => 
    c.type === "SAÍDA" && new Date(c.date) >= thirtyDaysAgo
  ).reduce((acc, c) => acc + parseFloat(c.amount), 0) || 0;
  const burnRate = saidasUltimos30Dias / 30;

  // Runway (meses)
  const runway = burnRate > 0 ? saldoAtual / (burnRate * 30) : 999;

  // Dados para gráfico de evolução (últimos 6 meses)
  const sixMonthsAgo = subMonths(new Date(), 6);
  const months = eachMonthOfInterval({
    start: sixMonthsAgo,
    end: new Date()
  });

  const evolutionData = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const entradas = cashFlowData?.filter(c => 
      c.type === "ENTRADA" && 
      new Date(c.date) >= monthStart && 
      new Date(c.date) <= monthEnd
    ).reduce((acc, c) => acc + parseFloat(c.amount), 0) || 0;

    const saidas = cashFlowData?.filter(c => 
      c.type === "SAÍDA" && 
      new Date(c.date) >= monthStart && 
      new Date(c.date) <= monthEnd
    ).reduce((acc, c) => acc + parseFloat(c.amount), 0) || 0;

    return {
      mes: format(month, "MMM/yy", { locale: ptBR }),
      entradas: Math.round(entradas),
      saidas: Math.round(saidas),
      saldo: Math.round(entradas - saidas)
    };
  });

  // Dados para gráfico de categorias
  const categoryData = categories?.map(cat => {
    const total = cashFlowData?.filter(c => c.categoryId === cat.id)
      .reduce((acc, c) => acc + parseFloat(c.amount), 0) || 0;
    return {
      name: cat.name,
      value: Math.round(total)
    };
  }).filter(c => c.value > 0).sort((a, b) => b.value - a.value).slice(0, 8) || [];

  // Dados para gráfico de recebíveis vs pagáveis
  const compareData = [
    {
      categoria: "Previsto",
      recebiveis: receivablesData?.filter(r => r.status === "PREVISTO").reduce((acc, r) => acc + parseFloat(r.amount), 0) || 0,
      pagaveis: payablesData?.filter(p => p.status === "ABERTO").reduce((acc, p) => acc + parseFloat(p.amount), 0) || 0
    },
    {
      categoria: "Recebido/Pago",
      recebiveis: receivablesData?.filter(r => r.status === "RECEBIDO").reduce((acc, r) => acc + parseFloat(r.amount), 0) || 0,
      pagaveis: payablesData?.filter(p => p.status === "PAGO").reduce((acc, p) => acc + parseFloat(p.amount), 0) || 0
    },
    {
      categoria: "Atrasado/Vencido",
      recebiveis: recebiveisAtrasados,
      pagaveis: pagaveisVencidos
    }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-8 h-8" />
            Dashboard CEO
          </h1>
          <p className="text-slate-400 mt-1">Visão executiva consolidada</p>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Receita Total
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                R$ {totalEntradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-400 mt-1">Últimos 6 meses</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Despesas Totais
                </span>
                <ArrowDownRight className="w-4 h-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                R$ {totalSaidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-400 mt-1">Últimos 6 meses</p>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${lucro >= 0 ? "from-green-900/20 to-green-800/10 border-green-800" : "from-red-900/20 to-red-800/10 border-red-800"}`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-sm font-medium ${lucro >= 0 ? "text-green-300" : "text-red-300"} flex items-center justify-between`}>
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Lucro
                </span>
                {lucro >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${lucro >= 0 ? "text-green-400" : "text-red-400"}`}>
                R$ {lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-400 mt-1">Margem: {totalEntradas > 0 ? ((lucro / totalEntradas) * 100).toFixed(1) : 0}%</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Saldo Atual
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${saldoAtual >= 0 ? "text-purple-400" : "text-red-400"}`}>
                R$ {saldoAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-400 mt-1">Runway: {runway > 12 ? "12+" : runway.toFixed(1)} meses</p>
            </CardContent>
          </Card>
        </div>

        {/* Alertas Críticos */}
        {(recebiveisAtrasados > 0 || pagaveisVencidos > 0 || runway < 3) && (
          <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-800">
            <CardHeader>
              <CardTitle className="text-yellow-300 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Alertas Críticos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recebiveisAtrasados > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg">
                  <span className="text-slate-300">Recebíveis Atrasados</span>
                  <Badge variant="destructive">R$ {recebiveisAtrasados.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Badge>
                </div>
              )}
              {pagaveisVencidos > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg">
                  <span className="text-slate-300">Pagáveis Vencidos</span>
                  <Badge variant="destructive">R$ {pagaveisVencidos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Badge>
                </div>
              )}
              {runway < 3 && (
                <div className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg">
                  <span className="text-slate-300">Runway Crítico</span>
                  <Badge variant="destructive">{runway.toFixed(1)} meses</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolução de Caixa */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Evolução de Caixa</CardTitle>
              <CardDescription className="text-slate-400">Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="mes" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="entradas" stroke="#10b981" strokeWidth={2} name="Entradas" />
                  <Line type="monotone" dataKey="saidas" stroke="#ef4444" strokeWidth={2} name="Saídas" />
                  <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={2} name="Saldo" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recebíveis vs Pagáveis */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Recebíveis vs Pagáveis</CardTitle>
              <CardDescription className="text-slate-400">Comparativo por status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={compareData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="categoria" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend />
                  <Bar dataKey="recebiveis" fill="#10b981" name="Recebíveis" />
                  <Bar dataKey="pagaveis" fill="#ef4444" name="Pagáveis" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Categorias */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Top 8 Categorias</CardTitle>
              <CardDescription className="text-slate-400">Por volume financeiro</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Métricas Operacionais */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Métricas Operacionais</CardTitle>
              <CardDescription className="text-slate-400">Indicadores chave</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">Burn Rate (diário)</span>
                <span className="text-white font-semibold">R$ {burnRate.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">Runway</span>
                <Badge variant="outline" className={runway < 3 ? "bg-red-900/50 text-red-300" : "bg-green-900/50 text-green-300"}>
                  {runway > 12 ? "12+" : runway.toFixed(1)} meses
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">Total Recebíveis</span>
                <span className="text-white font-semibold">R$ {totalRecebiveis.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">Total Pagáveis</span>
                <span className="text-white font-semibold">R$ {totalPagaveis.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">Margem de Lucro</span>
                <Badge variant="outline" className={lucro >= 0 ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"}>
                  {totalEntradas > 0 ? ((lucro / totalEntradas) * 100).toFixed(1) : 0}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
