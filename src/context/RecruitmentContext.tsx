import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Candidate, BenchResource, Interview } from '@/types/recruitment';
import { mockCandidates, mockBenchResources, mockInterviews } from '@/data/mockData';
import { toast } from 'sonner';

interface RecruitmentContextType {
    candidates: Candidate[];
    benchResources: BenchResource[];
    interviews: Interview[];
    updateCandidateStatus: (candidateId: string, status: Candidate['status']) => void;
    updateCandidateFeedback: (candidateId: string, round: 1 | 2, recommendation: string) => void;
    addCandidate: (candidate: Candidate) => void;
    addBenchResource: (resource: BenchResource) => void;
    updateBenchResource: (resource: BenchResource) => void;
    addInterview: (interview: Omit<Interview, 'id'>) => void;
    updateInterview: (interviewId: string, updates: Partial<Interview>) => void;
    cancelInterview: (interviewId: string) => void;
}

const RecruitmentContext = createContext<RecruitmentContextType | undefined>(undefined);

export const RecruitmentProvider = ({ children }: { children: ReactNode }) => {
    const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
    const [benchResources, setBenchResources] = useState<BenchResource[]>(mockBenchResources);
    const [interviews, setInterviews] = useState<Interview[]>(mockInterviews);

    const addCandidate = (candidate: Candidate) => {
        setCandidates((prev) => [candidate, ...prev]);
    };

    const addBenchResource = (resource: BenchResource) => {
        setBenchResources((prev) => [resource, ...prev]);
    };

    const updateBenchResource = (resource: BenchResource) => {
        setBenchResources((prev) => prev.map(r => r.id === resource.id ? resource : r));
    };

    const updateCandidateFeedback = (candidateId: string, round: 1 | 2, recommendation: string) => {
        setCandidates((prev) =>
            prev.map((c) => {
                if (c.id === candidateId) {
                    if (round === 1) {
                        return { ...c, round1Recommendation: recommendation };
                    } else {
                        return { ...c, round2Recommendation: recommendation };
                    }
                }
                return c;
            })
        );
    };

    const updateCandidateStatus = (candidateId: string, status: Candidate['status']) => {
        // Determine if we need to move to bench
        if (status === 'onboarded') {
            const candidate = candidates.find(c => c.id === candidateId);
            if (candidate && candidate.status !== 'onboarded') {
                const newResource: BenchResource = {
                    id: String(benchResources.length + 1),
                    name: candidate.name,
                    email: candidate.email,
                    phone: candidate.phone,
                    role: 'Bench Resource', // Default role, user can update later
                    skills: candidate.skills || [],
                    experience: candidate.experience || '0 years',
                    availableFrom: new Date(),
                    status: 'available',
                    location: candidate.location || 'Unknown',
                    expectedCTC: candidate.expectedCTC || '',
                    lastProject: '', // Initial bench resource has no last project tracked here yet
                };
                setBenchResources(prev => [newResource, ...prev]);
                toast.success(`${candidate.name} has been moved to Bench Resources`);
            }
        }

        setCandidates((prev) =>
            prev.map((c) => (c.id === candidateId ? { ...c, status } : c))
        );
    };

    const addInterview = (interview: Omit<Interview, 'id'>) => {
        const newInterview: Interview = {
            ...interview,
            id: String(interviews.length + 1),
        };
        setInterviews((prev) => [...prev, newInterview]);
        toast.success(`Interview scheduled for ${interview.candidateName}`);
    };

    const updateInterview = (interviewId: string, updates: Partial<Interview>) => {
        setInterviews((prev) => 
            prev.map((i) => i.id === interviewId ? { ...i, ...updates } : i)
        );
    };

    const cancelInterview = (interviewId: string) => {
        setInterviews((prev) => 
            prev.map((i) => i.id === interviewId ? { ...i, status: 'cancelled' as const } : i)
        );
        toast.info(`Interview has been cancelled`);
    };

    return (
        <RecruitmentContext.Provider value={{
            candidates,
            benchResources,
            interviews,
            updateCandidateStatus,
            updateCandidateFeedback,
            addCandidate,
            addBenchResource,
            updateBenchResource,
            addInterview,
            updateInterview,
            cancelInterview
        }}>
            {children}
        </RecruitmentContext.Provider>
    );
};

export const useRecruitment = () => {
    const context = useContext(RecruitmentContext);
    if (context === undefined) {
        throw new Error('useRecruitment must be used within a RecruitmentProvider');
    }
    return context;
};
