
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '@/types/user';

// Define the shape of the user object we'll store (without the password)
type AuthUser = Omit<User, 'password' | 'createdAt'>;

interface AuthContextType {
  user: AuthUser | null;
  login: (userData: AuthUser) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isEditor: () => boolean;
  isUser: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // On initial load, try to get user data from localStorage
    try {
        const storedUser = localStorage.getItem('readify-user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    } catch (error) {
        console.error("Could not parse user from localStorage", error);
        localStorage.removeItem('readify-user');
    }
  }, []);

  const login = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem('readify-user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('readify-user');
    // Optionally redirect to login page
    window.location.href = '/login';
  };

  const isAdmin = () => user?.role === 'Admin';
  const isEditor = () => user?.role === 'Editor';
  const isUser = () => user?.role === 'User';


  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isEditor, isUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
