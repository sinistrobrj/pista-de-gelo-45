
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AuthPage } from "@/components/AuthPage";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { TicketTypeManager } from "./components/TicketTypeManager";
import { AdminPanel } from "./components/AdminPanel";
import { CustomerAnalytics } from "./components/CustomerAnalytics";
import { PontoVenda } from "./components/PontoVenda";
import { Estoque } from "./components/Estoque";
import { Fidelidade } from "./components/Fidelidade";
import { Cadastro } from "./components/Cadastro";
import { Clientes } from "./components/Clientes";
import { Eventos } from "./components/Eventos";
import { Usuarios } from "./components/Usuarios";
import { Pista } from "./components/Pista";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tickets" element={<TicketTypeManager />} />
        <Route path="/ponto-venda" element={<PontoVenda />} />
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/fidelidade" element={<Fidelidade />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/pista" element={<Pista />} />
        <Route path="/analytics" element={<CustomerAnalytics />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/users" element={<Usuarios />} />
        <Route path="/auth" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppRoutes />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
