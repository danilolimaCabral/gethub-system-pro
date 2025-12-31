
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Building2, LayoutDashboard, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const { data: tenants, refetch } = trpc.tenant.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createTenant = trpc.tenant.create.useMutation({
    onSuccess: () => {
      toast.success("Empresa criada com sucesso!");
      setOpen(false);
      setName("");
      setSlug("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreateTenant = () => {
    if (!name || !slug) {
      toast.error("Preencha todos os campos");
      return;
    }
    createTenant.mutate({ name, slug });
  };

  const handleSelectTenant = (tenantId: number) => {
    localStorage.setItem("selectedTenantId", tenantId.toString());
    setLocation("/dashboard");
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  if (!isAuthenticated && !loading) {
    setLocation("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
        <div className="max-w-4xl w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-blue-500/10 p-4 rounded-2xl">
                <TrendingUp className="h-16 w-16 text-blue-500" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white">ERP Financeiro</h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Sistema completo de gestão financeira e administrativa com controle multi-empresa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <Building2 className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle className="text-white">Multi-Tenant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">Gerencie múltiplas empresas em uma única plataforma</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <LayoutDashboard className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle className="text-white">Dashboard Executivo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">Visão completa com KPIs e indicadores financeiros</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle className="text-white">Projeções</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">Análise de fluxo de caixa e projeções automáticas</p>
              </CardContent>
            </Card>
          </div>

          <div className="pt-8">
            <Button size="lg" onClick={() => window.location.href = getLoginUrl()} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
              Entrar no Sistema
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Bem-vindo, {user?.name}</h1>
            <p className="text-slate-400">Selecione uma empresa ou crie uma nova</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Nova Empresa
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Criar Nova Empresa</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Preencha os dados para criar uma nova empresa no sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Nome da Empresa</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Minha Empresa Ltda"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-white">Identificador (slug)</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="minha-empresa"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <p className="text-xs text-slate-400">Apenas letras minúsculas, números e hífens</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} className="border-slate-600 text-white">
                  Cancelar
                </Button>
                <Button onClick={handleCreateTenant} disabled={createTenant.isPending} className="bg-blue-600 hover:bg-blue-700">
                  {createTenant.isPending ? "Criando..." : "Criar Empresa"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {!tenants || tenants.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
            <Building2 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhuma empresa cadastrada</h3>
            <p className="text-slate-400 mb-6">Crie sua primeira empresa para começar a usar o sistema</p>
            <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Empresa
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((item) => (
              <Card
                key={item.tenant.id}
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                onClick={() => handleSelectTenant(item.tenant.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="bg-blue-500/10 p-3 rounded-lg">
                      <Building2 className="h-6 w-6 text-blue-500" />
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                      {item.role}
                    </span>
                  </div>
                  <CardTitle className="text-white mt-4">{item.tenant.name}</CardTitle>
                  <CardDescription className="text-slate-400">
                    @{item.tenant.slug}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Acessar Dashboard
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
