import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { fetchWorkerProfile } from '../services/casesService';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AUTH_KEY = 'regrove_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Rehydrate from localStorage so page refresh doesn't lose the session
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = async (u: User) => {
    let resolved = u;

    // If this is a social worker, fetch their real name from the backend
    // so the greeting shows "Kumar" instead of the hardcoded mock "Sarah"
    if (u.role === 'social_worker') {
      try {
        const profile = await fetchWorkerProfile();
        resolved = { ...u, fullName: profile.fullName };
      } catch {
        // If the fetch fails, fall back to whatever name was passed in
      }
    }

    setUser(resolved);
    localStorage.setItem(AUTH_KEY, JSON.stringify(resolved));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

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
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
