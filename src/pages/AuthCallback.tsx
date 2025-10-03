import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthService from '@/services/auth-service';

// UI Components
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithSocial, updateProfile } = useAuth();

  useEffect(() => {
    async function handleCallback() {
      try {
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        
        if (!code) {
          setStatus('error');
          setErrorMessage('No authorization code found');
          return;
        }

        // Determine provider from path
        const path = location.pathname.toLowerCase();
        const provider = path.includes('google') 
          ? 'google' 
          : path.includes('microsoft') 
            ? 'microsoft' 
            : null;
        
        if (!provider) {
          setStatus('error');
          setErrorMessage('Unknown authentication provider');
          return;
        }

        // Handle the callback
        const result = await AuthService.handleSocialLoginCallback(
          provider as 'google' | 'microsoft', 
          code
        );

        if (result.success && result.data) {
          // Login with social provider using token and user data
          if (result.data.token && result.data.user) {
            // Determine which provider based on callback URL
            const provider = path.includes('google') ? 'google' : 'microsoft';
            
            // Login with social data
            await loginWithSocial(provider, result.data.token, result.data.user);

            // Update profile completion status if needed
            if (result.data.user.hasProfile) {
              updateProfile(true);
            }
          }
          
          setStatus('success');
          
          // Determine redirect
          setTimeout(() => {
            if (result.data.user?.hasProfile) {
              navigate('/member-dashboard');
            } else {
              navigate('/complete-setup');
            }
          }, 1500);
        } else {
          setStatus('error');
          setErrorMessage(result.error || 'Authentication failed');
        }
      } catch (error: any) {
        console.error('Error during social login callback:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Authentication failed');
      }
    }

    handleCallback();
  }, [location, navigate, updateProfile, loginWithSocial]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="cosmic-card p-8 max-w-md w-full text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-orbitron font-bold mb-2">Establishing Connection...</h1>
          <p className="text-muted-foreground">Please wait while we complete your authentication</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="cosmic-card p-8 max-w-md w-full text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-red-500 text-4xl">×</span>
          </div>
          <h1 className="text-2xl font-orbitron font-bold mb-2">Authentication Failed</h1>
          <p className="text-muted-foreground mb-6">{errorMessage}</p>
          <Button onClick={() => navigate('/login')} className="btn-mission">
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="cosmic-card p-8 max-w-md w-full text-center">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
          <span className="text-green-500 text-4xl">✓</span>
        </div>
        <h1 className="text-2xl font-orbitron font-bold mb-2">Authentication Successful</h1>
        <p className="text-muted-foreground">Redirecting you to the dashboard...</p>
      </div>
    </div>
  );
};

export default AuthCallback;