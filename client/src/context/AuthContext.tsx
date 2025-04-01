import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContextType, User } from '../types';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5500';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// We need to make the AuthProvider accept toast functions as props for proper dependency injection
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastFunction, setToastFunction] = useState<any>(null);

  // Get toast function reference from ToastContext after initial render
  useEffect(() => {
    const getToastFn = async () => {
      // This is a workaround since we can't use useToast() directly at component level
      // We'll set the toast function after the first render when it's available
      try {
        const ToastContext = (await import('./ToastContext')).default;
        const useToast = (await import('./ToastContext')).useToast;
        // We're not actually using this function, just setting a reference for later
        setToastFunction({
          showSuccess: (message: string) => console.log('Toast success:', message),
          showError: (message: string) => console.log('Toast error:', message)
        });
      } catch (err) {
        console.error('Failed to load toast context', err);
      }
    };
    
    getToastFn();
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const adminStatus = localStorage.getItem('isAdmin');
      const savedUser = localStorage.getItem('user');

      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get('/api/v1/auth/protected');
          if (response.data.success) {
            if (savedUser) {
              setUser(JSON.parse(savedUser));
            }
            if (adminStatus === 'true') {
              setIsAdmin(true);
            }
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('isAdmin');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/v1/auth/sign-in', { 
        email, 
        password 
      });
      
      const { token, user: userData } = response.data;
      
      if (!token || !userData) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;      

      setUser(userData);
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Authentication failed';
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'No response from server. Please try again later.';
      } else {
        errorMessage = 'Login failed: ' + error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const adminLogin = async (code: string) => {
    if (code === '123456') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      return { success: true, message: 'Admin login successful!' };
    } else {
      throw new Error('Invalid admin code');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post('/api/v1/auth/sign-up', { 
        name, 
        email, 
        password 
      });
      
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Registration failed';
      if (error.response && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAdmin(false);
    return { success: true };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, adminLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};