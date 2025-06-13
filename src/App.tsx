
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AuthPage } from "@/components/AuthPage";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { CustomerAnalytics } from "./components/CustomerAnalytics";
import { PontoVenda } from "./components/PontoVenda";
import { Estoque } from "./components/Estoque";
import { Fidelidade } from "./components/Fidelidade";
import { Cadastro } from "./components/Cadastro";
import { Clientes } from "./components/Clientes";
import { Eventos } from "./components/Eventos";
import { Pista } from "./components/Pista";
import { VisitantesManager } from "./components/VisitantesManager";
import { useVisitanteTimer } from "@/hooks/useVisitanteTimer";
import NotFound from "./pages/NotFound";
import { Loader2, Clock } from "lucide-react";

const queryClient = new QueryClient();

function VisitanteTimer() {
  const { tempoRestante } = useVisitanteTimer();
  const { profile } = useAuth();
  
  if (profile?.tipo !== 'Visitante' || !tempoRestante) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2">
      <Clock className="w-4 h-4" />
      <span className="font-medium">{tempoRestante} min restantes</span>
    </div>
  );
}

function AppContent() {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const isAdmin = profile?.tipo === 'Administrador';
  const isVisitante = profile?.tipo === 'Visitante';

  return (
    <>
      <VisitanteTimer />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ponto-venda" element={<PontoVenda />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/fidelidade" element={<Fidelidade />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/pista" element={<Pista />} />
          <Route path="/analytics" element={<CustomerAnalytics />} />
          {isAdmin && <Route path="/visitantes" element={<VisitantesManager />} />}
          <Route path="/auth" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
