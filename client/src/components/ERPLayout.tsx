import { useAuth } from "@/_core/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Building2,
  LayoutDashboard,
  Wallet,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  ShoppingCart,
  Store,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  Upload,
  Shield,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavItemWithTour extends NavItem {
  dataTour?: string;
}

const navItems: NavItemWithTour[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, dataTour: "dashboard" },
  { title: "Caixa", href: "/cash-flow", icon: Wallet, dataTour: "cashflow" },
  { title: "Recebíveis", href: "/receivables", icon: TrendingUp, dataTour: "receivables" },
  { title: "Pagáveis", href: "/payables", icon: TrendingDown, dataTour: "payables" },
  { title: "DRE", href: "/dre", icon: BarChart3 },
  { title: "Estoque", href: "/stock", icon: Package },
  { title: "Importar Planilha", href: "/import", icon: Upload, dataTour: "import" },
];

const cadastrosItems: NavItemWithTour[] = [
  { title: "Empresas", href: "/companies", icon: Building2 },
  { title: "Produtos", href: "/products", icon: ShoppingCart },
  { title: "Clientes", href: "/customers", icon: Users },
  { title: "Fornecedores", href: "/suppliers", icon: Store },
  { title: "Categorias", href: "/categories", icon: Settings },
  { title: "Marketplaces", href: "/marketplaces", icon: Store },
];

interface ERPLayoutProps {
  children: React.ReactNode;
}

export default function ERPLayout({ children }: ERPLayoutProps) {
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const tenantId = parseInt(localStorage.getItem("selectedTenantId") || "0");
  const { data: tenant } = trpc.tenant.get.useQuery({ tenantId }, { enabled: tenantId > 0 });

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const NavLink = ({ item }: { item: NavItemWithTour }) => {
    const Icon = item.icon;
    const isActive = location === item.href;

    return (
      <Link href={item.href}>
        <a
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-slate-700/50",
            isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white"
          )}
          data-tour={item.dataTour}
        >
          <Icon className="h-4 w-4" />
          {item.title}
          {item.badge && (
            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
              {item.badge}
            </span>
          )}
        </a>
      </Link>
    );
  };

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700">
        <Link href="/">
          <a className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm">ERP Financeiro</span>
              {tenant && <span className="text-xs text-slate-400">{tenant.name}</span>}
            </div>
          </a>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-slate-400"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Principal
            </h3>
            <nav className="space-y-1">
              {navItems.filter(item => !item.dataTour || hasPermission(item.dataTour)).map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>

          <Separator className="bg-slate-700" />

          <div>
            <h3 className="mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Cadastros
            </h3>
            <nav className="space-y-1" data-tour="cadastros">
              {cadastrosItems.filter(item => !item.dataTour || hasPermission(item.dataTour)).map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>

          <Separator className="bg-slate-700" />

          <div>
            <h3 className="mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Sistema
            </h3>
            <nav className="space-y-1">
              {user?.role === 'admin' && (
                <NavLink item={{ title: "Usuários", href: "/users", icon: Shield }} />
              )}
              <NavLink item={{ title: "Configurações", href: "/settings", icon: Settings }} />
            </nav>
          </div>
        </div>
      </ScrollArea>

      <div className="border-t border-slate-700 p-4" data-tour="user-menu">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            onClick={() => window.location.href = "/"}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Empresas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-slate-700 bg-slate-800 transition-all duration-300",
          sidebarOpen ? "w-64" : "w-0"
        )}
      >
        {sidebarOpen && <SidebarContent />}
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 flex flex-col border-r border-slate-700 bg-slate-800 z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-700 bg-slate-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-400"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex text-slate-400"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}
