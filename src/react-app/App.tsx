import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import { PermissionsProvider } from "@/react-app/hooks/usePermissions";
import { ThemeProvider } from "@/react-app/hooks/useTheme";
import { ToastProvider } from "@/react-app/components/Toast";
import { ApolloProvider } from "@/shared/providers/ApolloProvider";
import { PerformanceProvider } from "@/shared/providers/PerformanceProvider";
import ErrorBoundary from "@/react-app/components/ErrorBoundary";
import ProtectedRoute from "@/react-app/components/ProtectedRoute";
import LoadingSpinner from "@/shared/components/atoms/LoadingSpinner";
import { 
  PERMISSIONS 
} from "@/shared/permissions";

// Lazy loading das páginas para code splitting
const HomePage = lazy(() => import("@/react-app/pages/Home"));
const AuthCallbackPage = lazy(() => import("@/react-app/pages/AuthCallback"));
const DashboardPage = lazy(() => import("@/react-app/pages/Dashboard"));
const SchedulePage = lazy(() => import("@/react-app/pages/Schedule"));
const PatientsPage = lazy(() => import("@/react-app/pages/Patients"));
const ProfessionalsPage = lazy(() => import("@/react-app/pages/Professionals"));
const WaitingListPage = lazy(() => import("@/react-app/pages/WaitingList"));
const ProceduresPage = lazy(() => import("@/react-app/pages/Procedures"));
const InventoryPage = lazy(() => import("@/react-app/pages/Inventory"));
const SettingsPage = lazy(() => import("@/react-app/pages/Settings"));
const WhatsAppPage = lazy(() => import("@/react-app/pages/WhatsApp"));
const AIAgentPage = lazy(() => import("@/react-app/pages/AIAgent"));
const ReportsPage = lazy(() => import("@/react-app/pages/Reports"));
const SuperAdminPage = lazy(() => import("@/react-app/pages/SuperAdmin"));
const AnamnesisPage = lazy(() => import("@/react-app/pages/Anamnesis"));
const PublicAnamnesisPage = lazy(() => import("@/react-app/pages/PublicAnamnesis"));

export default function App() {
  return (
    <ErrorBoundary>
      <PerformanceProvider>
        <AuthProvider>
          <ApolloProvider>
            <ThemeProvider>
              <PermissionsProvider>
                <ToastProvider>
                <Router>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/auth/callback" element={<AuthCallbackPage />} />
                      
                      {/* Public routes */}
                      <Route path="/anamnesis/:token" element={<PublicAnamnesisPage />} />
                      
                      {/* Protected routes */}
                      <Route path="/dashboard" element={
                        <ProtectedRoute requiredPermissions={[PERMISSIONS.DASHBOARD_VIEW]}>
                          <DashboardPage />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/agenda" element={
                        <ProtectedRoute requiredPermissions={[PERMISSIONS.APPOINTMENT_VIEW_ALL, PERMISSIONS.APPOINTMENT_VIEW_OWN]}>
                          <SchedulePage />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/pacientes" element={
                        <ProtectedRoute requiredPermissions={[PERMISSIONS.PATIENT_VIEW_ALL, PERMISSIONS.PATIENT_VIEW_OWN]}>
                          <PatientsPage />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/profissionais" element={
                        <ProtectedRoute requiredPermissions={[PERMISSIONS.PROFESSIONAL_VIEW_ALL]}>
                          <ProfessionalsPage />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/lista-espera" element={
                        <ProtectedRoute requiredPermissions={[PERMISSIONS.WAITING_LIST_VIEW]}>
                          <WaitingListPage />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/procedimentos" element={
                        <ProtectedRoute requiredPermissions={[PERMISSIONS.APPOINTMENT_VIEW_ALL, PERMISSIONS.APPOINTMENT_VIEW_OWN]}>
                          <ProceduresPage />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/estoque" element={
                        <ProtectedRoute requiredPermissions={[PERMISSIONS.INVENTORY_VIEW]}>
                          <InventoryPage />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/whatsapp" element={
                        <ProtectedRoute requiredPermissions={[PERMISSIONS.WHATSAPP_VIEW]}>
                          <WhatsAppPage />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/agente-ia" element={
                        <ProtectedRoute requiredPermissions={[PERMISSIONS.AI_AGENT_VIEW]}>
                          <AIAgentPage />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/anamnese" element={
                        <ProtectedRoute requiredPermissions={[PERMISSIONS.PATIENT_VIEW_ALL, PERMISSIONS.PATIENT_VIEW_OWN]}>
                          <AnamnesisPage />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/relatorios" element={
                        <ProtectedRoute requiredPermissions={[PERMISSIONS.REPORTS_VIEW_ALL, PERMISSIONS.REPORTS_VIEW_OWN]}>
                          <ReportsPage />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/super-admin" element={
                        <ProtectedRoute requiredPermissions={[PERMISSIONS.SUPER_ADMIN_ACCESS]}>
                          <SuperAdminPage />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/configuracoes" element={
                        <ProtectedRoute requiredPermissions={[PERMISSIONS.SETTINGS_VIEW]}>
                          <SettingsPage />
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </Suspense>
                </Router>
                </ToastProvider>
              </PermissionsProvider>
            </ThemeProvider>
          </ApolloProvider>
        </AuthProvider>
      </PerformanceProvider>
    </ErrorBoundary>
  );
}
