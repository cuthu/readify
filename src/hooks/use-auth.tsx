
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '@/types/user';
import Cookies from 'js-cookie';

// Define the shape of the user object we'll store (without the password)
export type AuthUser = Omit<User, 'password' | 'createdAt'>;

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (userData: AuthUser) => void;
  updateUser: (userData: AuthUser) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isEditor: () => boolean;
  isUser: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_COOKIE_NAME = 'readify-auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On initial load, try to get user data from the cookie
    try {
        const storedUser = Cookies.get(AUTH_COOKIE_NAME);
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    } catch (error) {
        console.error("Could not parse user from cookie", error);
        Cookies.remove(AUTH_COOKIE_NAME);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = (userData: AuthUser) => {
    setUser(userData);
    // Set cookie to expire in 7 days
    Cookies.set(AUTH_COOKIE_NAME, JSON.stringify(userData), { expires: 7, path: '/' });
  };
  
  const updateUser = (userData: AuthUser) => {
    setUser(userData);
    Cookies.set(AUTH_COOKIE_NAME, JSON.stringify(userData), { expires: 7, path: '/' });
  }

  const logout = () => {
    setUser(null);
    Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
    // Use window.location to force a full page reload to clear all state and trigger middleware
    window.location.href = '/login';
  };

  const isAdmin = () => user?.role === 'Admin';
  const isEditor = () => user?.role === 'Editor';
  const isUser = () => user?.role === 'User';


  return (
    <AuthContext.Provider value={{ user, isLoading, login, updateUser, logout, isAdmin, isEditor, isUser }}>
      {!isLoading && children}
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
