'use client';

import React, { createContext, useContext, useState, ReactNode, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from "next-auth/react";
import { User, UserRole } from '@/types/recruitment';
import { useUsers } from './UsersContext';

interface AuthContextType {
  user: User | null;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const { getUserByEmail } = useUsers();
  const router = useRouter();
  const { data: session, status } = useSession();
  const syncedEmailRef = useRef<string | null>(null);
  const initialLoadDoneRef = useRef(false);

  // Sync NextAuth session with local auth state
  React.useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      // Only sync once per email to prevent loops
      if (syncedEmailRef.current === session.user.email) {
        return;
      }

      const foundUser = getUserByEmail(session.user.email);
      if (foundUser) {
        if (!foundUser.isActive) {
          console.warn(`Inactive user attempted access: ${session.user.email}`);
          signOut({ callbackUrl: '/login?error=inactive' });
          return;
        }

        console.log(`Syncing user permissions for: ${session.user.email}`);
        syncedEmailRef.current = session.user.email;
        setUser({
          ...foundUser,
          originalRole: foundUser.role,
          permissions: foundUser.permissions
        });
      } else {
        // Not a registered user - sign them out
        console.warn(`Unauthorized access attempt by ${session.user.email}`);
        signOut({ callbackUrl: '/login?error=unauthorized' });
      }
    } else if (status === 'unauthenticated') {
      // Clear state on sign out
      syncedEmailRef.current = null;
      setUser(null);
    }
  }, [session, status, getUserByEmail]);

  // Load user from localStorage on mount (as fallback only)
  React.useEffect(() => {
    if (initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;

    const savedUser = localStorage.getItem('hireflow_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Only load if it looks like a valid user object with permissions
        if (parsed?.email && parsed?.role && parsed?.permissions) {
          setUser(parsed);
          syncedEmailRef.current = parsed.email;
        } else {
          localStorage.removeItem('hireflow_user');
        }
      } catch (e) {
        localStorage.removeItem('hireflow_user');
      }
    }
  }, []);

  // Save user to localStorage when it changes
  React.useEffect(() => {
    if (user) {
      localStorage.setItem('hireflow_user', JSON.stringify(user));
    } else if (status === 'unauthenticated') {
      localStorage.removeItem('hireflow_user');
    }
  }, [user, status]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hireflow_user');
    signOut({ callbackUrl: '/login' });
  };


  const switchRole = (role: UserRole) => {
    if (user) {
      // Keep the original role if it exists, otherwise use current role as original
      const originalRole = user.originalRole || user.role;
      setUser({ ...user, role, originalRole });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      logout,
      switchRole,
      isAuthenticated: !!user
    }}>
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
