import { useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
        navigate('/dashboard');
      } catch (error) {
        console.error('Authentication failed:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, []); // Remove dependencies to avoid re-running the callback

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin mb-4 flex justify-center">
          <Loader2 className="w-8 h-8 text-blue-600" />
        </div>
        <p className="text-gray-600">Autenticando...</p>
      </div>
    </div>
  );
}
