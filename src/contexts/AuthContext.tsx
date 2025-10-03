import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '@/lib/api';
import AuthService from '@/services/auth-service';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'member' | 'host';
  hasProfile: boolean;
  branch?: string;
  semester?: string;
  year?: string;
  college?: string;
  profilePicture?: string;
  provider?: 'email' | 'google' | 'microsoft';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: 'member' | 'host') => Promise<boolean>;
  loginWithSocial: (provider: 'google' | 'microsoft', token: string, userData: any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (hasProfile: boolean) => void;
  updateUserProfile: (profileData: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check for existing auth token on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'member' | 'host'): Promise<boolean> => {
    // Force clear all registration data on every login attempt
    localStorage.removeItem('qrcode-registrations');
    
    try {
      // Try to authenticate with the backend first
      const response = await api.post('/auth/login', {
        email,
        password,
        role
      });
      
      // If backend auth succeeds, use that response
      if (response.data && response.data.access_token) {
        localStorage.setItem('authToken', response.data.access_token);
        
        const userData: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name || 'User',
          role: role,
          hasProfile: response.data.user.has_profile || false,
          profilePicture: response.data.user.profile_picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
    } catch (error) {
      console.log("Backend auth failed, using demo login");
      
      // Fallback to demo mode if backend auth fails
      // Check for newly registered users first
      const registeredUserEmail = localStorage.getItem('devEmail');
      const registeredUserName = localStorage.getItem('devUsername');
      const registeredUserPass = localStorage.getItem('devPassword');
      
      // Check if this is a newly registered user
      if (registeredUserEmail && email === registeredUserEmail && 
          ((registeredUserPass && password === registeredUserPass) || password === 'root')) {
        
        // Clear registrations for new user login
        localStorage.removeItem('qrcode-registrations');

        const newUser: User = {
          id: Math.random().toString(36).substring(2, 15), // Generate unique ID
          email,
          name: registeredUserName || 'New User',
          role,
          hasProfile: true, // Mark as having a profile since they completed setup
          profilePicture: 'https://i.pravatar.cc/150?u=' + email,
        };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        return true;
      }
      
      // Demo user login
      if (email === 'test-member@example.com' && password === 'root') {
        // Clear registrations for demo user login
        localStorage.removeItem('qrcode-registrations');

        const demoUser: User = {
          id: '1', // Special ID for demo user
          email: 'test-member@example.com',
          name: 'Demo User',
          role,
          hasProfile: false,
          profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
        };
        setUser(demoUser);
        localStorage.setItem('user', JSON.stringify(demoUser));
        return true;
      }
      
      // Sriram host login
      if (email === 'sriram@gmail.com' && password === 'root') {
        // Clear registrations for demo user login
        localStorage.removeItem('qrcode-registrations');
        
        const sriramHost: User = {
          id: 'sriram_host', // Special ID for Sriram host
          email: 'sriram@gmail.com',
          name: 'Sriram Kundapur',
          role,
          hasProfile: true,
          profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        };
        setUser(sriramHost);
        localStorage.setItem('user', JSON.stringify(sriramHost));
        return true;
      }

      // Demo host login
      if (email === 'test-host@example.com' && password === 'root') {
        // Clear registrations for demo user login
        localStorage.removeItem('qrcode-registrations');
        
        const demoHost: User = {
          id: '2', // Special ID for demo host
          email: 'test-host@example.com',
          name: 'Demo Host',
          role,
          hasProfile: false,
          profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
        };
        setUser(demoHost);
        localStorage.setItem('user', JSON.stringify(demoHost));
        return true;
      }
      
      return false;
    }
  };

  const loginWithSocial = async (provider: 'google' | 'microsoft', token: string, userData: any): Promise<boolean> => {
    // Clear any previous registration data to ensure a clean state
    localStorage.removeItem('qrcode-registrations');
    
    try {
      const response = await api.post(`/auth/social-login?provider=${provider}`, {
        token
      });
      
      if (response.data && response.data.access_token) {
        localStorage.setItem('authToken', response.data.access_token);
        
        const socialUser: User = {
          id: userData.sub || userData.id || '1',
          email: userData.email,
          name: userData.name || 'Social User',
          role: 'member',
          hasProfile: userData.hasProfile || false,
          profilePicture: userData.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
          provider: provider
        };
        
        setUser(socialUser);
        localStorage.setItem('user', JSON.stringify(socialUser));
        return true;
      }
    } catch (error) {
      console.error('Social login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('qrcode-registrations'); // Also clear on logout
  };

  const updateProfile = async (hasProfile: boolean) => {
    if (user) {
      try {
        // Attempt to update profile on backend
        await api.patch(`/users/${user.id}/profile`, { has_profile: hasProfile });
      } catch (error) {
        console.error('Failed to update profile on backend:', error);
      }
      
      const updatedUser = { ...user, hasProfile };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const updateUserProfile = async (profileData: Partial<User>) => {
    if (user) {
      try {
        // Format data for backend
        const backendData = {
          name: profileData.name,
          branch: profileData.branch,
          semester: profileData.semester,
          year: profileData.year,
          college: profileData.college,
          profile_picture: profileData.profilePicture
        };
        
        // Attempt to update profile on backend
        await api.patch(`/users/${user.id}`, backendData);
      } catch (error) {
        console.error('Failed to update user profile on backend:', error);
      }
      
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    loginWithSocial,
    logout,
    updateProfile,
    updateUserProfile,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};