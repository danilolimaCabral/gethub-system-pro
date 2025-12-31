import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import Categories from "./pages/Categories";
import Marketplaces from "./pages/Marketplaces";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import CashFlow from "./pages/CashFlow";
import Receivables from "./pages/Receivables";
import Payables from "./pages/Payables";
import Stock from "./pages/Stock";
import Settings from "./pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/companies"} component={Companies} />
      <Route path={"/categories"} component={Categories} />
      <Route path={"/marketplaces"} component={Marketplaces} />
      <Route path={"/suppliers"} component={Suppliers} />
      <Route path={"/customers"} component={Customers} />
      <Route path={"/products"} component={Products} />
      <Route path={"/cash-flow"} component={CashFlow} />
      <Route path={"/receivables"} component={Receivables} />
      <Route path={"/payables"} component={Payables} />
      <Route path={"/stock"} component={Stock} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
