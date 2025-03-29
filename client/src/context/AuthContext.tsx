import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContextType, User } from '../types';
import toast from 'react-hot-toast';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
        toast.error('Invalid response from server');
        throw new Error('Invalid response from server');
      }
      

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;      

      setUser(userData);
      toast.success('Login successful!');
    } catch (error: any) {

      console.error('Login error:', error);
      
      if (error.response) {


        const errorMessage = error.response.data?.message || 'Authentication failed';
        toast.error(errorMessage);
      } else if (error.request) {

        toast.error('No response from server. Please try again later.');
      } else {

        toast.error('Login failed: ' + error.message);
      }
      
      throw error;
    }
  };

  const adminLogin = async (code: string) => {
    if (code === '123456') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      toast.success('Admin login successful!');
    } else {
      toast.error('Invalid admin code');
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
      toast.success('Registration successful!');
    } catch (error: any) {

      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Registration failed');
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAdmin(false);
    toast.success('Logged out successfully');
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