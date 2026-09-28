import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EnactusUser, AuthSession } from '../../types/auth';
import { enactusSSO } from './ssoAdapter';

interface AuthContextType {
  user: EnactusUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isFacultyAdvisor: boolean;
  isMember: boolean;
  isReadOnly: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const current = enactusSSO.getCurrentSession();
    if (current) {
      setSession(current);
    }
    setIsLoading(false);
  }, []);

  const login = async (email?: string, password?: string) => {
    setIsLoading(true);
    try {
      const newSession = await enactusSSO.loginWithCredentials(email, password);
      setSession(newSession);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await enactusSSO.logout();
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const user = session?.user || null;
  const isAuthenticated = !!user;
  const role = user?.role;

  const isAdmin = role === 'Administrator' || role === 'Super Admin' || role === 'Admin';
  const isSuperAdmin = role === 'Super Admin';
  const isFacultyAdvisor = role === 'Faculty Advisor';
  const isMember = role === 'Member';
  const isReadOnly = isFacultyAdvisor;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        isLoading,
        login,
        logout,
        isAdmin,
        isSuperAdmin,
        isFacultyAdvisor,
        isMember,
        isReadOnly,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
