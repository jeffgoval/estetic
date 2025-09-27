import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import Layout from '@/react-app/components/Layout';
import { ProfessionalsPage } from '@/shared/features/professionals';

export default function Professionals() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-pulse text-blue-600">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <ProfessionalsPage />
    </Layout>
  );
}
