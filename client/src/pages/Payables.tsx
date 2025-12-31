import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { exportToExcel, exportToPDF, formatCurrency, formatDate } from "@/lib/export";
import { Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { CreditCard, Plus, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Payables() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [formData, setFormData] = useState({
    dueDate: format(new Date(), "yyyy-MM-dd"),
    description: "",
    amount: "",
    supplierId: "",
    categoryId: "",
    status: "ABERTO" as "ABERTO" | "PAGO" | "VENCIDO",
    costType: "FIXO" as "FIXO" | "VARIÁVEL",
  });

  const utils = trpc.useUtils();
  const { data: payables, isLoading } = trpc.payable.list.useQuery({ tenantId: 1 });
  const { data: suppliers } = trpc.supplier.list.useQuery({ tenantId: 1 });
  const { data: categories } = trpc.category.list.useQuery({ tenantId: 1 });

  const createMutation = trpc.payable.create.useMutation({
    onSuccess: () => {
      toast.success("Pagável criado com sucesso!");
      utils.payable.list.invalidate();
      handleClose();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.payable.update.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      utils.payable.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      tenantId: 1,
      dueDate: formData.dueDate,
      description: formData.description,
      amount: formData.amount,
      supplierId: formData.supplierId ? parseInt(formData.supplierId) : undefined,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
      status: formData.status,
      costType: formData.costType,
    });
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      dueDate: format(new Date(), "yyyy-MM-dd"),
      description: "",
      amount: "",
      supplierId: "",
      categoryId: "",
      status: "ABERTO",
      costType: "FIXO",
    });
  };

  const markAsPaid = (id: number) => {
    updateMutation.mutate({ id, tenantId: 1, status: "PAGO", paidDate: format(new Date(), "yyyy-MM-dd") });
  };

  const filteredPayables = payables?.filter(p => {
    if (filter === "all") return true;
    return p.status === filter.toUpperCase();
  }) || [];

  const totalAberto = payables?.filter(p => p.status === "ABERTO").reduce((acc, p) => acc + parseFloat(p.amount), 0) || 0;
  const totalPago = payables?.filter(p => p.status === "PAGO").reduce((acc, p) => acc + parseFloat(p.amount), 0) || 0;
  const totalVencido = payables?.filter(p => p.status === "VENCIDO").reduce((acc, p) => acc + parseFloat(p.amount), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <CreditCard className="w-8 h-8" />
              Pagáveis
            </h1>
            <p className="text-slate-400 mt-1">Contas a pagar</p>
          </div>
          <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            Nova Conta
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-300 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Em Aberto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                R$ {totalAberto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                R$ {totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Vencido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                R$ {totalVencido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Lista de Pagáveis</CardTitle>
            <CardDescription className="text-slate-400">
              {filteredPayables.length} registros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={setFilter} className="mb-4">
              <TabsList className="bg-slate-700">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="aberto">Em Aberto</TabsTrigger>
                <TabsTrigger value="pago">Pago</TabsTrigger>
                <TabsTrigger value="vencido">Vencido</TabsTrigger>
              </TabsList>
            </Tabs>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Vencimento</TableHead>
                    <TableHead className="text-slate-300">Descrição</TableHead>
                    <TableHead className="text-slate-300">Fornecedor</TableHead>
                    <TableHead className="text-slate-300">Tipo</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300 text-right">Valor</TableHead>
                    <TableHead className="text-slate-300 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayables.map((item) => {
                    const daysLate = differenceInDays(new Date(), new Date(item.dueDate));
                    return (
                      <TableRow key={item.id} className="border-slate-700">
                        <TableCell className="text-slate-400">
                          {format(new Date(item.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                          {daysLate > 0 && item.status !== "PAGO" && (
                            <span className="text-red-400 text-xs ml-2">({daysLate}d atraso)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-300 font-medium">{item.description}</TableCell>
                        <TableCell className="text-slate-400">
                          {suppliers?.find(s => s.id === item.supplierId)?.name || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-700 text-slate-300">
                            {item.costType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              item.status === "PAGO"
                                ? "bg-green-900/50 text-green-300 border-green-800"
                                : item.status === "VENCIDO"
                                ? "bg-red-900/50 text-red-300 border-red-800"
                                : "bg-yellow-900/50 text-yellow-300 border-yellow-800"
                            }
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-slate-300">
                          R$ {parseFloat(item.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.status !== "PAGO" && (
                            <Button
                              size="sm"
                              onClick={() => markAsPaid(item.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Marcar Pago
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Nova Conta a Pagar</DialogTitle>
              <DialogDescription className="text-slate-400">
                Registre uma despesa
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="dueDate">Data de Vencimento *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                  className="bg-slate-700 border-slate-600 text-white"
                />
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
                <Label htmlFor="costType">Tipo de Custo *</Label>
                <Select value={formData.costType} onValueChange={(value: "FIXO" | "VARIÁVEL") => setFormData({ ...formData, costType: value })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="FIXO">Fixo</SelectItem>
                    <SelectItem value="VARIÁVEL">Variável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="supplier">Fornecedor</Label>
                <Select value={formData.supplierId} onValueChange={(value) => setFormData({ ...formData, supplierId: value })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {suppliers?.map((supplier) => (
                      <SelectItem key={supplier.id} value={String(supplier.id)}>{supplier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
