import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";

export function usePermissions() {
  const { user } = useAuth();
  const { data: permissions = [] } = trpc.user.getPermissions.useQuery(undefined, {
    enabled: !!user,
  });

  const hasPermission = (module: string): boolean => {
    // Admin tem acesso a tudo
    if (user?.role === 'admin') {
      return true;
    }
    
    // Verifica se o usuário tem a permissão específica
    return permissions.includes(module);
  };

  const hasAnyPermission = (modules: string[]): boolean => {
    return modules.some(module => hasPermission(module));
  };

  const hasAllPermissions = (modules: string[]): boolean => {
    return modules.every(module => hasPermission(module));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
