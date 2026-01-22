import { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, UserPermissions } from '@/types/recruitment';

interface UsersContextType {
    users: User[];
    addUser: (user: User) => void;
    updateUser: (user: User) => void;
    deleteUser: (userId: string) => void;
    getUserByEmail: (email: string) => User | undefined;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

const getDefaultPermissions = (role: UserRole): UserPermissions => {
    if (role === 'super_admin') {
        return {
            isSuperAdmin: true,
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
        };
    }

    const baseFeatures = {
        dashboard: true,
        demands: role === 'admin' || role === 'hiring_manager',
        demandRoles: role === 'admin' || role === 'hiring_manager',
        candidates: role === 'admin' || role === 'hiring_manager',
        interviews: role === 'admin' || role === 'interviewer',
        offers: role === 'admin',
        onboarding: role === 'admin',
        bench: role === 'admin',
        projects: role === 'admin',
    };

    return {
        canManageUsers: false,
        features: baseFeatures,
    };
};

// Initial users with permissions
const initialUsers: User[] = [
    { id: '1', name: 'John Admin', email: 'superadmin@company.com', role: 'super_admin', isActive: true, permissions: getDefaultPermissions('super_admin') },
    { id: '2', name: 'Sarah HR', email: 'admin@company.com', role: 'admin', isActive: true, permissions: getDefaultPermissions('admin') },
    { id: '3', name: 'Mike Manager', email: 'hm@company.com', role: 'hiring_manager', isActive: true, permissions: getDefaultPermissions('hiring_manager') },
    { id: '4', name: 'Lisa Tech', email: 'interviewer@company.com', role: 'interviewer', isActive: true, permissions: getDefaultPermissions('interviewer') },
    { id: '5', name: 'Raj Kumar', email: 'raj.kumar@company.com', role: 'interviewer', isActive: true, permissions: getDefaultPermissions('interviewer') },
    { id: '6', name: 'Priya Nair', email: 'priya.nair@company.com', role: 'hiring_manager', isActive: false, permissions: getDefaultPermissions('hiring_manager') },
];

export const UsersProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useState<User[]>(initialUsers);

    const addUser = (user: User) => {
        setUsers([...users, user]);
    };

    const updateUser = (updatedUser: User) => {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const deleteUser = (userId: string) => {
        setUsers(users.filter(u => u.id !== userId));
    };

    const getUserByEmail = (email: string) => {
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    };

    return (
        <UsersContext.Provider value={{ users, addUser, updateUser, deleteUser, getUserByEmail }}>
            {children}
        </UsersContext.Provider>
    );
};

export const useUsers = () => {
    const context = useContext(UsersContext);
    if (!context) {
        throw new Error('useUsers must be used within UsersProvider');
    }
    return context;
};
