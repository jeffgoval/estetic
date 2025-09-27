import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import Layout from '@/react-app/components/Layout';
import ProtectedRoute from '@/react-app/components/ProtectedRoute';
import { DashboardPage } from '@/shared/features/dashboard';
import { PERMISSIONS } from '@/shared/permissions';


export default function Dashboard() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-pulse text-blue-600">Carregando dashboard...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <ProtectedRoute requiredPermissions={[PERMISSIONS.DASHBOARD_VIEW]}>
      <Layout>
        <div className="p-6">
          <DashboardPage />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
