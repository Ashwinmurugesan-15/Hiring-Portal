import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Candidates from "./pages/Candidates";
import Demands from "./pages/Demands";
import Interviews from "./pages/Interviews";
import UserManagement from "./pages/UserManagement";
import Offers from "./pages/Offers";
import Onboarding from "./pages/Onboarding";
import Bench from "./pages/Bench";
import Projects from "./pages/Projects";
import DemandRoles from "./pages/DemandRoles";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidates"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'hiring_manager']}>
            <Candidates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/demands"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'hiring_manager']}>
            <Demands />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interviews"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'interviewer']}>
            <Interviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/offers"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <Offers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bench"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <Bench />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <Projects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/demand-roles"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin', 'hiring_manager']}>
            <DemandRoles />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

import { DemandsProvider } from "@/context/DemandsContext";
import { RecruitmentProvider } from "@/context/RecruitmentContext";
import { UsersProvider } from "@/context/UsersContext";

// ... (other imports)

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UsersProvider>
        <AuthProvider>
          <DemandsProvider>
            <RecruitmentProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </RecruitmentProvider>
          </DemandsProvider>
        </AuthProvider>
      </UsersProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
