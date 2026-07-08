import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { Loader2, AlertCircle } from 'lucide-react';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { handleOAuthCallback } = useGoogleCalendar();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const oauthError = urlParams.get('error');
      
      console.log('GoogleCallback - Auth loading:', authLoading);
      console.log('GoogleCallback - User present:', !!user);
      console.log('GoogleCallback - Code present:', code ? 'YES' : 'NO');
      console.log('GoogleCallback - Error:', oauthError);
      
      if (oauthError) {
        console.error('GoogleCallback - OAuth error:', oauthError);
        setError('Error de autenticación con Google');
        setTimeout(() => navigate('/calendario?error=' + oauthError), 2000);
        return;
      }
      
      // Wait for auth to finish loading
      if (authLoading) {
        console.log('GoogleCallback - Waiting for auth to load...');
        return;
      }
      
      // Check if user is authenticated
      if (!user) {
        console.error('GoogleCallback - No user found after auth loaded');
        setError('No se pudo identificar al usuario. Por favor inicia sesión.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      if (code) {
        console.log('GoogleCallback - User ID:', user.id);
        console.log('GoogleCallback - Exchanging code for tokens...');
        try {
          await handleOAuthCallback(code);
          navigate('/calendario?connected=true');
        } catch (err) {
          console.error('GoogleCallback - Error during token exchange:', err);
          setError('Error al conectar con Google Calendar');
          setTimeout(() => navigate('/calendario?error=connection_failed'), 2000);
        }
      } else {
        console.error('GoogleCallback - No code or error found');
        navigate('/calendario');
      }
    };

    processCallback();
  }, [authLoading, user, handleOAuthCallback, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">Error de conexión</h2>
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground">Redirigiendo...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">Conectando con Google Calendar...</h2>
            <p className="text-muted-foreground">
              {authLoading ? 'Verificando sesión...' : 'Por favor espera mientras completamos la autenticación'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
