import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const MONTHS = [
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];

export default function DRE() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const tenantId = parseInt(localStorage.getItem("selectedTenantId") || "0");

  const { data: monthlyDRE, isLoading: monthlyLoading } = trpc.dre.getMonthly.useQuery(
    {
      tenantId,
      month: selectedMonth,
      year: selectedYear,
    },
    { enabled: tenantId > 0 }
  );

  const { data: comparativeDRE, isLoading: comparativeLoading } = trpc.dre.getComparative.useQuery(
    {
      tenantId,
      year: selectedYear,
    },
    { enabled: tenantId > 0 }
  );

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const monthName = MONTHS.find(m => m.value === selectedMonth.toString())?.label || "";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Demonstrativo de Resultados (DRE)</h1>
        <p className="text-slate-400">Análise financeira mensal e comparativa do seu negócio</p>
      </div>

      {/* Seletor de Período */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-300 mb-2 block">Mês</label>
                <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {MONTHS.map(month => (
                      <SelectItem key={month.value} value={month.value} className="text-white">
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-300 mb-2 block">Ano</label>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {[2023, 2024, 2025, 2026].map(year => (
                      <SelectItem key={year} value={year.toString()} className="text-white">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 items-end">
              <Button variant="outline" onClick={handlePreviousMonth} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                ← Anterior
              </Button>
              <Button variant="outline" onClick={handleNextMonth} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                Próximo →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicadores Principais */}
      {monthlyDRE && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-500" />
                Receitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(monthlyDRE.receitas)}</div>
              <p className="text-xs text-slate-400 mt-1">{monthName} de {selectedYear}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(monthlyDRE.despesas)}</div>
              <p className="text-xs text-slate-400 mt-1">{monthName} de {selectedYear}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Margem Bruta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${monthlyDRE.margemBruta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(monthlyDRE.margemBruta)}
              </div>
              <p className="text-xs text-slate-400 mt-1">{monthlyDRE.margemBruta >= 0 ? 'Lucro' : 'Prejuízo'}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Target className="h-4 w-4 text-yellow-500" />
                Margem Líquida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${monthlyDRE.margemLiquida >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {monthlyDRE.margemLiquida.toFixed(2)}%
              </div>
              <p className="text-xs text-slate-400 mt-1">Percentual</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Receitas vs Despesas */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Receitas vs Despesas</CardTitle>
            <CardDescription className="text-slate-400">{monthName} de {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyDRE ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: "Receitas", value: monthlyDRE.receitas },
                  { name: "Despesas", value: monthlyDRE.despesas },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-slate-400">Carregando...</div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico Comparativo Anual */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Evolução Mensal</CardTitle>
            <CardDescription className="text-slate-400">Ano de {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            {comparativeDRE ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={comparativeDRE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Legend />
                  <Line type="monotone" dataKey="receitas" stroke="#10b981" name="Receitas" strokeWidth={2} />
                  <Line type="monotone" dataKey="despesas" stroke="#ef4444" name="Despesas" strokeWidth={2} />
                  <Line type="monotone" dataKey="lucro" stroke="#3b82f6" name="Lucro" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-slate-400">Carregando...</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      {monthlyDRE && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Resumo Detalhado</CardTitle>
            <CardDescription className="text-slate-400">{monthName} de {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">Receitas Totais</span>
                <span className="text-lg font-semibold text-green-500">{formatCurrency(monthlyDRE.receitas)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                <span className="text-slate-300">Despesas Totais</span>
                <span className="text-lg font-semibold text-red-500">{formatCurrency(monthlyDRE.despesas)}</span>
              </div>
              <div className="border-t border-slate-600 pt-3 mt-3">
                <div className="flex justify-between items-center p-3 bg-blue-600/20 rounded-lg">
                  <span className="text-slate-300 font-semibold">Resultado (Lucro/Prejuízo)</span>
                  <span className={`text-lg font-bold ${monthlyDRE.margemBruta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(monthlyDRE.margemBruta)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
