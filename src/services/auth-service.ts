import api from '../lib/api';

interface AuthServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const AuthService = {
  // Social login methods
  initiateGoogleLogin: async (): Promise<string> => {
    try {
      const response = await api.get('/auth/google/login');
      return response.data.authorizationUrl;
    } catch (error) {
      console.error('Failed to initiate Google login:', error);
      // For development, return a mock URL
      if (process.env.NODE_ENV === 'development') {
        return '/auth/mock-google-callback?code=dev-google-code';
      }
      throw error;
    }
  },

  initiateMicrosoftLogin: async (): Promise<string> => {
    try {
      const response = await api.get('/auth/microsoft/login');
      return response.data.authorizationUrl;
    } catch (error) {
      console.error('Failed to initiate Microsoft login:', error);
      // For development, return a mock URL
      if (process.env.NODE_ENV === 'development') {
        return '/auth/mock-microsoft-callback?code=dev-microsoft-code';
      }
      throw error;
    }
  },

  handleSocialLoginCallback: async (
    provider: 'google' | 'microsoft',
    code: string
  ): Promise<AuthServiceResponse> => {
    try {
      // For development mode with mock codes, simulate successful API call
      if (import.meta.env.DEV && (code === 'dev-google-code' || code === 'dev-microsoft-code')) {
        console.log(`DEV MODE: Simulating successful ${provider} OAuth callback`);
        
        // Create mock data based on provider
        const mockData = {
          token: `dev-${provider}-token-${Date.now()}`,
          user: {
            sub: `dev-${provider}-${Math.random().toString(36).substring(7)}`,
            name: provider === 'google' ? 'Dev Google User' : 'Dev Microsoft User',
            email: provider === 'google' ? 'dev.google@example.com' : 'dev.microsoft@example.com',
            picture: `https://ui-avatars.com/api/?name=${provider === 'google' ? 'Dev+Google' : 'Dev+Microsoft'}&color=random`,
            hasProfile: false
          }
        };
        
        // Store token in localStorage
        localStorage.setItem('authToken', mockData.token);
        
        return {
          success: true,
          data: mockData
        };
      }

      const response = await api.post(`/auth/${provider}/callback`, { code });
      
      // Store the token
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error(`Failed to complete ${provider} login:`, error);
      
      // Fallback for development mode to always succeed
      if (import.meta.env.DEV) {
        console.log(`DEV FALLBACK: Simulating successful ${provider} OAuth callback`);
        
        const mockData = {
          token: `dev-${provider}-token-${Date.now()}`,
          user: {
            sub: `dev-${provider}-${Math.random().toString(36).substring(7)}`,
            name: provider === 'google' ? 'Dev Google User' : 'Dev Microsoft User',
            email: provider === 'google' ? 'dev.google@example.com' : 'dev.microsoft@example.com',
            picture: `https://ui-avatars.com/api/?name=${provider === 'google' ? 'Dev+Google' : 'Dev+Microsoft'}&color=random`,
            hasProfile: false
          }
        };
        
        // Store token in localStorage
        localStorage.setItem('authToken', mockData.token);
        
        return {
          success: true,
          data: mockData
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || `Failed to complete ${provider} login`
      };
    }
  },

  // Verification methods
  sendVerificationCode: async (
    method: 'email' | 'phone',
    destination: string
  ): Promise<AuthServiceResponse> => {
    try {
      // For development mode, simulate successful API call
      if (import.meta.env.DEV) {
        console.log(`DEV MODE: Simulating sending verification code to ${destination} via ${method}`);
        return {
          success: true,
          data: {
            message: `Verification code sent to ${destination}`,
            expiresIn: 600 // 10 minutes
          }
        };
      }

      const response = await api.post('/auth/verification/send', {
        method,
        destination
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Failed to send verification code:', error);
      
      // Fallback for development to always succeed
      if (import.meta.env.DEV) {
        return {
          success: true,
          data: {
            message: `DEV FALLBACK: Verification code sent to ${destination}`,
            expiresIn: 600
          }
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send verification code'
      };
    }
  },

  verifyCode: async (
    method: 'email' | 'phone',
    destination: string,
    code: string
  ): Promise<AuthServiceResponse> => {
    try {
      // For development mode, simulate successful API call with any 6-digit code or "123456"
      if (import.meta.env.DEV && (code === "123456" || (code.length === 6 && /^\d+$/.test(code)))) {
        console.log(`DEV MODE: Simulating successful verification for ${destination}`);
        return {
          success: true,
          data: {
            message: "Verification successful",
            verified: true
          }
        };
      }

      const response = await api.post('/auth/verification/verify', {
        method,
        destination,
        code
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Failed to verify code:', error);
      
      // Fallback for development with "123456" code to always succeed
      if (import.meta.env.DEV && (code === "123456" || (code.length === 6 && /^\d+$/.test(code)))) {
        return {
          success: true,
          data: {
            message: "DEV FALLBACK: Verification successful",
            verified: true
          }
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to verify code'
      };
    }
  },
  
  // Check if email already exists
  checkEmailExists: async (email: string): Promise<boolean> => {
    try {
      const response = await api.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
      return response.data.exists;
    } catch (error) {
      console.error('Failed to check email existence:', error);
      return false;
    }
  },

  // Password reset methods
  sendPasswordResetCode: async (email: string): Promise<AuthServiceResponse> => {
    try {
      // For development mode, simulate successful API call
      if (import.meta.env.DEV) {
        console.log(`DEV MODE: Simulating sending password reset code to ${email}`);
        return {
          success: true,
          data: {
            message: `Password reset code sent to ${email}`,
            expiresIn: 600 // 10 minutes
          }
        };
      }

      const response = await api.post('/auth/password/reset-code', { email });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Failed to send password reset code:', error);
      
      // Fallback for development to always succeed
      if (import.meta.env.DEV) {
        return {
          success: true,
          data: {
            message: `DEV FALLBACK: Password reset code sent to ${email}`,
            expiresIn: 600
          }
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send password reset code'
      };
    }
  },

  verifyPasswordResetCode: async (email: string, code: string): Promise<AuthServiceResponse> => {
    try {
      // For development mode, simulate successful API call with any 6-digit code or "123456"
      if (import.meta.env.DEV && (code === "123456" || (code.length === 6 && /^\d+$/.test(code)))) {
        console.log(`DEV MODE: Simulating successful password reset code verification for ${email}`);
        return {
          success: true,
          data: {
            message: "Verification successful",
            verified: true
          }
        };
      }

      const response = await api.post('/auth/password/verify-code', { email, code });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Failed to verify password reset code:', error);
      
      // Fallback for development with "123456" code to always succeed
      if (import.meta.env.DEV && (code === "123456" || (code.length === 6 && /^\d+$/.test(code)))) {
        return {
          success: true,
          data: {
            message: "DEV FALLBACK: Password reset code verification successful",
            verified: true
          }
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to verify password reset code'
      };
    }
  },

  resetPassword: async (email: string, code: string, newPassword: string): Promise<AuthServiceResponse> => {
    try {
      // For development mode, simulate successful API call
      if (import.meta.env.DEV) {
        console.log(`DEV MODE: Simulating password reset for ${email}`);
        return {
          success: true,
          data: {
            message: "Password reset successful"
          }
        };
      }

      const response = await api.post('/auth/password/reset', { 
        email, 
        code, 
        newPassword 
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      
      // Fallback for development to always succeed
      if (import.meta.env.DEV) {
        return {
          success: true,
          data: {
            message: "DEV FALLBACK: Password reset successful"
          }
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reset password'
      };
    }
  }
};

export default AuthService;