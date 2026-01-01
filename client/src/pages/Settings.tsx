import ERPLayout from "@/components/ERPLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, User, Lock, HelpCircle, RefreshCw } from "lucide-react";
import { resetTutorial } from "@/components/Tutorial";

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Dados atualizados com sucesso!");
      // Recarregar página para atualizar contexto de autenticação
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar dados");
    },
  });

  const updatePassword = trpc.user.updatePassword.useMutation({
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao alterar senha");
    },
  });

  const handleUpdateProfile = () => {
    if (!name || !email) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Email inválido");
      return;
    }

    updateProfile.mutate({ name, email });
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos de senha");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres");
      return;
    }

    updatePassword.mutate({ currentPassword, newPassword });
  };

  const handleResetTutorial = () => {
    resetTutorial();
    toast.success("Tutorial será exibido novamente!");
  };

  return (
    <ERPLayout>
      <div className="p-8 space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
          <p className="text-slate-400">Gerencie suas preferências e dados pessoais</p>
        </div>

        {/* Dados Pessoais */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-white">Dados Pessoais</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Atualize suas informações de perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Nome Completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <Button 
              onClick={handleUpdateProfile} 
              disabled={updateProfile.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Alteração de Senha */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-500" />
              <CardTitle className="text-white">Segurança</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Altere sua senha de acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-white">Senha Atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <Separator className="bg-slate-700" />
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-white">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha (mín. 6 caracteres)"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite a nova senha novamente"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <Button 
              onClick={handleUpdatePassword} 
              disabled={updatePassword.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {updatePassword.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Alterando...
                </>
              ) : (
                "Alterar Senha"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Tutorial */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-white">Tutorial</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Reexibir o tour guiado do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 mb-4">
              Clique no botão abaixo para ver novamente o tutorial interativo que explica as principais funcionalidades do sistema.
            </p>
            <Button 
              onClick={handleResetTutorial}
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reexibir Tutorial
            </Button>
          </CardContent>
        </Card>
      </div>
    </ERPLayout>
  );
}
