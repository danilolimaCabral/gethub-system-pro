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
import { DollarSign, Plus, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Receivables() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [formData, setFormData] = useState({
    dueDate: format(new Date(), "yyyy-MM-dd"),
    description: "",
    amount: "",
    customerId: "",
    status: "PREVISTO" as "PREVISTO" | "RECEBIDO" | "ATRASADO",
  });

  const utils = trpc.useUtils();
  const { data: receivables, isLoading } = trpc.receivable.list.useQuery({ tenantId: 1 });
  const { data: customers } = trpc.customer.list.useQuery({ tenantId: 1 });

  const createMutation = trpc.receivable.create.useMutation({
    onSuccess: () => {
      toast.success("Recebível criado com sucesso!");
      utils.receivable.list.invalidate();
      handleClose();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.receivable.update.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      utils.receivable.list.invalidate();
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
      customerId: formData.customerId ? parseInt(formData.customerId) : undefined,
      status: formData.status,
    });
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      dueDate: format(new Date(), "yyyy-MM-dd"),
      description: "",
      amount: "",
      customerId: "",
      status: "PREVISTO",
    });
  };

  const markAsReceived = (id: number) => {
    updateMutation.mutate({ id, tenantId: 1, status: "RECEBIDO", receivedDate: format(new Date(), "yyyy-MM-dd") });
  };

  const filteredReceivables = receivables?.filter(r => {
    if (filter === "all") return true;
    return r.status === filter.toUpperCase();
  }) || [];

  const totalPrevisto = receivables?.filter(r => r.status === "PREVISTO").reduce((acc, r) => acc + parseFloat(r.amount), 0) || 0;
  const totalRecebido = receivables?.filter(r => r.status === "RECEBIDO").reduce((acc, r) => acc + parseFloat(r.amount), 0) || 0;
  const totalAtrasado = receivables?.filter(r => r.status === "ATRASADO").reduce((acc, r) => acc + parseFloat(r.amount), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <DollarSign className="w-8 h-8" />
              Recebíveis
            </h1>
            <p className="text-slate-400 mt-1">Valores a receber</p>
          </div>
          <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            Novo Recebível
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-300 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Previsto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                R$ {totalPrevisto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Recebido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                R$ {totalRecebido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Atrasado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                R$ {totalAtrasado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Lista de Recebíveis</CardTitle>
            <CardDescription className="text-slate-400">
              {filteredReceivables.length} registros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={setFilter} className="mb-4">
              <TabsList className="bg-slate-700">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="previsto">Previsto</TabsTrigger>
                <TabsTrigger value="recebido">Recebido</TabsTrigger>
                <TabsTrigger value="atrasado">Atrasado</TabsTrigger>
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
                    <TableHead className="text-slate-300">Cliente</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300 text-right">Valor</TableHead>
                    <TableHead className="text-slate-300 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceivables.map((item) => {
                    const daysLate = differenceInDays(new Date(), new Date(item.dueDate));
                    return (
                      <TableRow key={item.id} className="border-slate-700">
                        <TableCell className="text-slate-400">
                          {format(new Date(item.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                          {daysLate > 0 && item.status !== "RECEBIDO" && (
                            <span className="text-red-400 text-xs ml-2">({daysLate}d atraso)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-300 font-medium">{item.description}</TableCell>
                        <TableCell className="text-slate-400">
                          {customers?.find(c => c.id === item.customerId)?.name || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              item.status === "RECEBIDO"
                                ? "bg-green-900/50 text-green-300 border-green-800"
                                : item.status === "ATRASADO"
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
                          {item.status !== "RECEBIDO" && (
                            <Button
                              size="sm"
                              onClick={() => markAsReceived(item.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Marcar Recebido
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
              <DialogTitle>Novo Recebível</DialogTitle>
              <DialogDescription className="text-slate-400">
                Registre um valor a receber
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
                <Label htmlFor="customer">Cliente</Label>
                <Select value={formData.customerId} onValueChange={(value) => setFormData({ ...formData, customerId: value })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {customers?.map((customer) => (
                      <SelectItem key={customer.id} value={String(customer.id)}>{customer.name}</SelectItem>
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
