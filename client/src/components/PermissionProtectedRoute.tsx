import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useLocation } from "wouter";

interface PermissionProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission: string;
}

export function PermissionProtectedRoute({ children, requiredPermission }: PermissionProtectedRouteProps) {
  const { hasPermission } = usePermissions();
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (!hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <Card className="bg-slate-800 border-slate-700 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-600/20 p-4 rounded-full">
                <ShieldAlert className="h-12 w-12 text-red-500" />
              </div>
            </div>
            <CardTitle className="text-white text-2xl">Acesso Negado</CardTitle>
            <CardDescription className="text-slate-400">
              Você não tem permissão para acessar este módulo
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-400 mb-6">
              Entre em contato com o administrador do sistema para solicitar acesso.
            </p>
            <Button
              onClick={() => setLocation("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
