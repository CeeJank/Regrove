import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
<<<<<<< HEAD
  token: string | null;
  login: (user: User, token: string) => void;
=======
  login: (user: User) => void;
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

<<<<<<< HEAD
const restoreUser = (): User | null => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(restoreUser);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const login = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('token', t);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{
      user, role: user?.role ?? null, token,
      login, logout, isAuthenticated: !!user && !!token,
    }}>
=======
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (u: User) => setUser(u);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
<<<<<<< HEAD
};
=======
};
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
