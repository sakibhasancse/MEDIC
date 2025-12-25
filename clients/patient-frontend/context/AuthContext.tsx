'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: string;
  role: 'patient';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (newData: any) => void;
}

interface RegisterData {
  name: string;
  phone: string;
  password: string;
  age?: number;
  gender?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('patient_token');
    const savedUser = localStorage.getItem('patient_user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('patient_token');
        localStorage.removeItem('patient_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (phone: string, password: string) => {
    try {
      const response = await authAPI.login({ phone, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('patient_token', access_token);
      localStorage.setItem('patient_user', JSON.stringify(userData));
      
      // Set cookie for middleware
      document.cookie = `patient_token=${access_token}; path=/; max-age=86400; SameSite=Lax`;
      
      setUser(userData);
      
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authAPI.register(data);
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('patient_token', access_token);
      localStorage.setItem('patient_user', JSON.stringify(userData));
      
      // Set cookie for middleware
      document.cookie = `patient_token=${access_token}; path=/; max-age=86400; SameSite=Lax`;
      
      setUser(userData);
      
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('patient_token');
    localStorage.removeItem('patient_user');
    
    // Clear cookie
    document.cookie = 'patient_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/');
  };

  const updateUser = (newData: any) => {
    localStorage.setItem('patient_user', JSON.stringify(newData));
    setUser(newData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
