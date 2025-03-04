
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {userLogin, userRegister} from "../services/api/users-api/auth.ts";
import {jwtDecode} from "jwt-decode";

export interface User {
  id: string;
  email: string;
  company?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, company: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in (from localStorage or session cookie)
    const storedUser = localStorage.getItem('accountbridge_user');
    const storedToken = localStorage.getItem('accountbridge_token');

    if (storedUser && storedToken) {
      if(isTokenExpired(storedToken)){
        logout()
      }
      else{
        setCurrentUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Replace with actual API call to your backend
      const response = await userLogin(email, password);

      const userData = response.data;
      setCurrentUser(userData.user);
      localStorage.setItem('accountbridge_user', JSON.stringify(userData.user));
      localStorage.setItem('accountbridge_token', userData.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, company: string) => {
    setLoading(true);
    try {
      // Replace with actual API call to your backend
      const response = await userRegister(email, password, company)

      const userData = response.data;
      setCurrentUser(userData.user);
      localStorage.setItem('accountbridge_user', JSON.stringify(userData.user));
      localStorage.setItem('accountbridge_token', userData.token);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('accountbridge_user');
    localStorage.removeItem('accountbridge_token');
    navigate('/login');
  };

  const resetPassword = async (email: string) => {
    try {
      // Replace with actual API call to your backend
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Password reset request failed');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded: any = jwtDecode(token);
      console.log(decoded.exp*1000 - Date.now() )
      return decoded.exp * 1000 < Date.now(); // Convert `exp` to milliseconds
    } catch (error) {
      return true; // Treat as expired if token is invalid
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};