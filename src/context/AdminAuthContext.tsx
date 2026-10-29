import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  adminUser: { id: string; email: string; name: string; role: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('at_admin_token'));
  const [adminUser, setAdminUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('at_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verify stored session on boot
    const verifySession = async () => {
      const storedToken = localStorage.getItem('at_admin_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAdminUser(data.user);
          setToken(storedToken);
        } else {
          // Token expired or invalid
          localStorage.removeItem('at_admin_token');
          localStorage.removeItem('at_admin_user');
          setToken(null);
          setAdminUser(null);
        }
      } catch (err) {
        console.error('Session verification error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.adminLogin({ email, password });
      if (data.success && data.token) {
        setToken(data.token);
        setAdminUser(data.user);
        localStorage.setItem('at_admin_token', data.token);
        localStorage.setItem('at_admin_user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await api.adminLogout(token);
      } catch (e) {
        // ignore logout network errors
      }
    }
    localStorage.removeItem('at_admin_token');
    localStorage.removeItem('at_admin_user');
    setToken(null);
    setAdminUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        adminUser,
        login,
        logout,
        isLoading,
        error,
        clearError,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
