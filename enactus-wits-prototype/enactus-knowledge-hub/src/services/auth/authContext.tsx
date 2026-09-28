import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EnactusUser, AuthSession } from '../../types/auth';
import { enactusSSO } from './ssoAdapter';

interface AuthContextType {
  user: EnactusUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  personas: EnactusUser[];
  login: (personaId?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchPersona: (personaId: string) => Promise<void>;
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

  const login = async (personaId?: string) => {
    setIsLoading(true);
    try {
      const newSession = await enactusSSO.loginWithSSO(personaId);
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

  const switchPersona = async (personaId: string) => {
    await login(personaId);
  };

  const user = session?.user || null;
  const isAuthenticated = !!user;
  const role = user?.role;

  const isAdmin = role === 'Administrator' || role === 'Super Administrator';
  const isSuperAdmin = role === 'Super Administrator';
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
        personas: enactusSSO.getAvailablePersonas(),
        login,
        logout,
        switchPersona,
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
