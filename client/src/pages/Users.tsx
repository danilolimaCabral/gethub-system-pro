import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Shield, User, Check, X } from "lucide-react";

const AVAILABLE_MODULES = [
  { id: "dashboard", label: "Dashboard", description: "Visão geral do sistema" },
  { id: "cashflow", label: "Caixa", description: "Gestão de fluxo de caixa" },
  { id: "receivables", label: "Recebíveis", description: "Contas a receber" },
  { id: "payables", label: "Pagáveis", description: "Contas a pagar" },
  { id: "stock", label: "Estoque", description: "Controle de estoque" },
  { id: "companies", label: "Empresas", description: "Cadastro de empresas" },
  { id: "products", label: "Produtos", description: "Cadastro de produtos" },
  { id: "customers", label: "Clientes", description: "Cadastro de clientes" },
  { id: "suppliers", label: "Fornecedores", description: "Cadastro de fornecedores" },
  { id: "categories", label: "Categorias", description: "Categorias financeiras" },
  { id: "marketplaces", label: "Marketplaces", description: "Gestão de marketplaces" },
  { id: "settings", label: "Configurações", description: "Configurações do sistema" },
];

export default function Users() {

  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);

  const { data: users, isLoading, refetch } = trpc.user.listAll.useQuery();
  const updatePermissionsMutation = trpc.user.updatePermissions.useMutation({
    onSuccess: () => {
      toast.success("Permissões atualizadas com sucesso");
      setSelectedUser(null);
      setEditingPermissions([]);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar permissões");
    },
  });

  const handleEditPermissions = (userId: number, currentPermissions: string[]) => {
    setSelectedUser(userId);
    setEditingPermissions(currentPermissions || []);
  };

  const handleTogglePermission = (moduleId: string) => {
    if (editingPermissions.includes(moduleId)) {
      setEditingPermissions(editingPermissions.filter(p => p !== moduleId));
    } else {
      setEditingPermissions([...editingPermissions, moduleId]);
    }
  };

  const handleSavePermissions = () => {
    if (selectedUser) {
      updatePermissionsMutation.mutate({
        userId: selectedUser,
        permissions: editingPermissions,
      });
    }
  };

  const handleCancel = () => {
    setSelectedUser(null);
    setEditingPermissions([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Gerenciamento de Usuários</h1>
        <p className="text-slate-400">Gerencie permissões de acesso aos módulos do sistema</p>
      </div>

      <div className="grid gap-6">
        {users?.map((user) => (
          <Card key={user.id} className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">{user.name || "Sem nome"}</CardTitle>
                    <CardDescription className="text-slate-400">{user.email}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-600/20 text-purple-400' 
                      : 'bg-blue-600/20 text-blue-400'
                  }`}>
                    {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </div>
                  {selectedUser !== user.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPermissions(user.id, user.permissions || [])}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Gerenciar Permissões
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            {selectedUser === user.id ? (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {AVAILABLE_MODULES.map((module) => (
                    <div
                      key={module.id}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors cursor-pointer"
                      onClick={() => handleTogglePermission(module.id)}
                    >
                      <Checkbox
                        id={`${user.id}-${module.id}`}
                        checked={editingPermissions.includes(module.id)}
                        onCheckedChange={() => handleTogglePermission(module.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`${user.id}-${module.id}`}
                          className="text-sm font-medium text-white cursor-pointer"
                        >
                          {module.label}
                        </label>
                        <p className="text-xs text-slate-400">{module.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-700">
                  <Button
                    onClick={handleSavePermissions}
                    disabled={updatePermissionsMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {updatePermissionsMutation.isPending ? "Salvando..." : "Salvar Permissões"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updatePermissionsMutation.isPending}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(user.permissions && user.permissions.length > 0) ? (
                    user.permissions.map((permission) => {
                      const module = AVAILABLE_MODULES.find(m => m.id === permission);
                      return module ? (
                        <div
                          key={permission}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-400"
                        >
                          {module.label}
                        </div>
                      ) : null;
                    })
                  ) : (
                    <div className="text-sm text-slate-400">Nenhuma permissão configurada</div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {(!users || users.length === 0) && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-slate-600 mb-4" />
            <p className="text-slate-400">Nenhum usuário encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
