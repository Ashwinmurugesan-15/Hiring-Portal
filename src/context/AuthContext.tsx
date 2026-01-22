import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/recruitment';
import { useUsers } from './UsersContext';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fallback mock users for demo mode (when no email is provided)
const mockUsers: Record<UserRole, User> = {
  super_admin: {
    id: '1',
    name: 'John Doe',
    email: 'superadmin@company.com',
    role: 'super_admin',
    isActive: true,
    permissions: {
      canManageUsers: true,
      features: {
        dashboard: true,
        demands: true,
        demandRoles: true,
        candidates: true,
        interviews: true,
        offers: true,
        onboarding: true,
        bench: true,
        projects: true,
      },
    },
  },
  admin: {
    id: '2',
    name: 'Sarah Smith',
    email: 'admin@company.com',
    role: 'admin',
    isActive: true,
    permissions: {
      canManageUsers: false,
      features: {
        dashboard: true,
        demands: true,
        demandRoles: true,
        candidates: true,
        interviews: true,
        offers: true,
        onboarding: true,
        bench: true,
        projects: true,
      },
    },
  },
  hiring_manager: {
    id: '3',
    name: 'Mike Johnson',
    email: 'hm@company.com',
    role: 'hiring_manager',
    isActive: true,
    permissions: {
      canManageUsers: false,
      features: {
        dashboard: true,
        demands: true,
        demandRoles: true,
        candidates: true,
        interviews: false,
        offers: false,
        onboarding: false,
        bench: false,
        projects: false,
      },
    },
  },
  interviewer: {
    id: '4',
    name: 'Lisa Brown',
    email: 'interviewer@company.com',
    role: 'interviewer',
    isActive: true,
    permissions: {
      canManageUsers: false,
      features: {
        dashboard: true,
        demands: false,
        demandRoles: false,
        candidates: false,
        interviews: true,
        offers: false,
        onboarding: false,
        bench: false,
        projects: false,
      },
    },
  },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const { getUserByEmail } = useUsers();

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user exists by email in the global users context
    if (email) {
      const foundUser = getUserByEmail(email);
      if (foundUser && foundUser.isActive) {
        // Set originalRole when logging in
        setUser({ ...foundUser, originalRole: foundUser.role });
        return true;
      }
    }

    // Fallback to role-based login (for demo mode where email is empty)
    const hardcodedUser = mockUsers[role];
    if (hardcodedUser) {
      // Set originalRole when logging in
      setUser({ ...hardcodedUser, originalRole: role });
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
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
      login,
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
