import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Demand } from '@/types/recruitment';
import { mockDemands } from '@/data/mockData';

interface DemandsContextType {
    demands: Demand[];
    addDemand: (newDemand: Omit<Demand, 'id' | 'createdAt' | 'applicants' | 'interviewed' | 'offers'>) => void;
    updateDemand: (updatedDemand: Demand) => void;
    closeDemand: (id: string) => void;
    reopenDemand: (id: string) => void;
}

const DemandsContext = createContext<DemandsContextType | undefined>(undefined);

export const DemandsProvider = ({ children }: { children: ReactNode }) => {
    const [demands, setDemands] = useState<Demand[]>(mockDemands);

    const addDemand = (newDemand: Omit<Demand, 'id' | 'createdAt' | 'applicants' | 'interviewed' | 'offers'>) => {
        const demand: Demand = {
            ...newDemand,
            id: String(demands.length + 1),
            createdAt: new Date(),
            applicants: 0,
            interviewed: 0,
            offers: 0,
        };
        setDemands((prev) => [demand, ...prev]);
    };

    const updateDemand = (updatedDemand: Demand) => {
        setDemands((prev) => prev.map((d) => (d.id === updatedDemand.id ? updatedDemand : d)));
    };

    const closeDemand = (id: string) => {
        updateDemand({
            ...demands.find((d) => d.id === id)!,
            status: 'closed',
        });
    };

    const reopenDemand = (id: string) => {
        updateDemand({
            ...demands.find((d) => d.id === id)!,
            status: 'open',
            reopenedAt: new Date(),
        });
    };

    return (
        <DemandsContext.Provider value={{ demands, addDemand, updateDemand, closeDemand, reopenDemand }}>
            {children}
        </DemandsContext.Provider>
    );
};

export const useDemands = () => {
    const context = useContext(DemandsContext);
    if (context === undefined) {
        throw new Error('useDemands must be used within a DemandsProvider');
    }
    return context;
};
