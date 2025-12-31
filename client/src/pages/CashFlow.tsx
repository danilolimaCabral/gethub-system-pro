import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Wallet, Plus, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CashFlow() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    amount: "",
    type: "ENTRADA" as "ENTRADA" | "SAÍDA",
    categoryId: "",
  });

  const utils = trpc.useUtils();
  const { data: movements, isLoading } = trpc.cashFlow.list.useQuery({ tenantId: 1 });
  const { data: categories } = trpc.category.list.useQuery({ tenantId: 1 });

  const createMutation = trpc.cashFlow.create.useMutation({
    onSuccess: () => {
      toast.success("Lançamento criado com sucesso!");
      utils.cashFlow.list.invalidate();
      handleClose();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      tenantId: 1,
      date: formData.date,
      description: formData.description,
      amount: formData.amount,
      type: formData.type,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
    });
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      date: format(new Date(), "yyyy-MM-dd"),
      description: "",
      amount: "",
      type: "ENTRADA",
      categoryId: "",
    });
  };

  // Calcular saldo
  const balance = movements?.reduce((acc, mov) => {
    const amount = parseFloat(mov.amount);
    return mov.type === "ENTRADA" ? acc + amount : acc - amount;
  }, 0) || 0;

  const totalEntradas = movements?.filter(m => m.type === "ENTRADA")
    .reduce((acc, m) => acc + parseFloat(m.amount), 0) || 0;
  
  const totalSaidas = movements?.filter(m => m.type === "SAÍDA")
    .reduce((acc, m) => acc + parseFloat(m.amount), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Wallet className="w-8 h-8" />
              Fluxo de Caixa
            </h1>
            <p className="text-slate-400 mt-1">Controle de entradas e saídas</p>
          </div>
          <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            Novo Lançamento
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Entradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                R$ {totalEntradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-300 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Total Saídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                R$ {totalSaidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${balance >= 0 ? "from-blue-900/20 to-blue-800/10 border-blue-800" : "from-red-900/20 to-red-800/10 border-red-800"}`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-sm font-medium ${balance >= 0 ? "text-blue-300" : "text-red-300"} flex items-center gap-2`}>
                <Wallet className="w-4 h-4" />
                Saldo Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? "text-blue-400" : "text-red-400"}`}>
                R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Movimentações */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Movimentações</CardTitle>
            <CardDescription className="text-slate-400">
              {movements?.length || 0} lançamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Data</TableHead>
                    <TableHead className="text-slate-300">Descrição</TableHead>
                    <TableHead className="text-slate-300">Categoria</TableHead>
                    <TableHead className="text-slate-300">Tipo</TableHead>
                    <TableHead className="text-slate-300 text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements?.map((movement) => (
                    <TableRow key={movement.id} className="border-slate-700">
                      <TableCell className="text-slate-400">
                        {format(new Date(movement.date), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-slate-300 font-medium">{movement.description}</TableCell>
                      <TableCell className="text-slate-400">
                        {categories?.find(c => c.id === movement.categoryId)?.name || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={movement.type === "ENTRADA" ? "default" : "destructive"} className={movement.type === "ENTRADA" ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"}>
                          {movement.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${movement.type === "ENTRADA" ? "text-green-400" : "text-red-400"}`}>
                        {movement.type === "ENTRADA" ? "+" : "-"} R$ {parseFloat(movement.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Novo Lançamento */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Novo Lançamento</DialogTitle>
              <DialogDescription className="text-slate-400">
                Registre uma entrada ou saída no caixa
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo *</Label>
                <Select value={formData.type} onValueChange={(value: "ENTRADA" | "SAÍDA") => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="ENTRADA">Entrada</SelectItem>
                    <SelectItem value="SAÍDA">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="amount">Valor *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose} className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                  {createMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
