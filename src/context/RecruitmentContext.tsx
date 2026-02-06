'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Candidate, BenchResource, Interview, EmailTemplate } from '@/types/recruitment';
import { mockBenchResources } from '@/data/mockData';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { getFilteredCandidatesForUser, getFilteredInterviewsForUser } from '@/utils/candidateFilters';

interface RecruitmentContextType {
    candidates: Candidate[];
    filteredCandidates: Candidate[];
    benchResources: BenchResource[];
    interviews: Interview[];
    filteredInterviews: Interview[];
    updateCandidateStatus: (candidateId: string, status: Candidate['status']) => void;
    updateCandidateFeedback: (candidateId: string, round: 1 | 2, recommendation: string) => void;
    addCandidate: (candidate: Candidate) => void;
    addBenchResource: (resource: BenchResource) => void;
    updateBenchResource: (resource: BenchResource) => void;
    addInterview: (interview: Omit<Interview, 'id'>) => void;
    updateInterview: (interviewId: string, updates: Partial<Interview>) => void;
    cancelInterview: (interviewId: string) => void;
    saveScreeningFeedback: (candidateId: string, feedback: string) => void;
    updateInterviewStatus: (candidateId: string, status: Candidate['interviewStatus']) => void;
    updateCandidateOfferDetails: (candidateId: string, updates: Partial<Pick<Candidate, 'offeredCTC' | 'offeredPosition' | 'dateOfJoining' | 'status' | 'experience' | 'currentCompany'>>) => void;
    updateCandidateOnboardingTask: (candidateId: string, taskId: string, completed: boolean) => Promise<void>;
    updateCandidate: (candidateId: string, updates: Partial<Candidate>) => Promise<void>;
    deleteCandidate: (candidateId: string) => void;
    sendEmail: (to: string, subject: string, html: string) => Promise<{ success: boolean; error?: any }>;
    emailTemplates: EmailTemplate[];
    updateEmailTemplate: (templateId: string, updates: Partial<EmailTemplate>) => void;
}

const RecruitmentContext = createContext<RecruitmentContextType | undefined>(undefined);

export const RecruitmentProvider = ({ children }: { children: ReactNode }) => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [benchResources, setBenchResources] = useState<BenchResource[]>(mockBenchResources);
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const { isAuthenticated, user } = useAuth();

    // Compute filtered candidates based on user role and email
    const filteredCandidates = useMemo(() => {
        return getFilteredCandidatesForUser(candidates, interviews, user);
    }, [candidates, interviews, user]);

    // Compute filtered interviews based on user role and email
    const filteredInterviews = useMemo(() => {
        return getFilteredInterviewsForUser(interviews, user);
    }, [interviews, user]);

    useEffect(() => {
        const fetchData = async () => {
            if (!isAuthenticated) return;

            console.log('Fetching recruitment data...');
            try {
                // Fetch external applicants alongside internal data
                const [candRes, intRes, extAppRes] = await Promise.all([
                    fetch('/api/candidates'),
                    fetch('/api/interviews'),
                    fetch('/api/integrations/applicants')
                ]);

                if (!candRes.ok || !intRes.ok) {
                    throw new Error(`API error: ${candRes.status} / ${intRes.status}`);
                }

                const cands = await candRes.json();
                const ints = await intRes.json();

                // Process external applicants
                let externalCandidates: any[] = [];
                if (extAppRes.ok) {
                    const extApps = await extAppRes.json();
                    externalCandidates = extApps.map((app: any) => ({
                        id: `ext-${app.id}`, // Prefix ID to avoid collision
                        name: app.name,
                        email: app.email,
                        phone: app.phone,
                        role: app.role, // Map to display role
                        status: app.status === 'Applied' ? 'applied' : 'interview_scheduled', // Map to valid status key
                        appliedAt: new Date(app.applied_at),
                        skills: [app.role], // Default skill from role
                        experience: 'External', // Placeholder
                        location: 'Remote', // Placeholder
                        source: 'GuhaTek Careers',
                        resumeLink: app.resume_url,
                        currentRound: 1,
                        interviewStatus: 'pending'
                    }));
                } else {
                    console.warn('Failed to fetch external applicants');
                }

                console.log('Fetched candidates:', cands.length);
                console.log('Fetched interviews:', ints.length);
                console.log('Fetched external applicants:', externalCandidates.length);

                // Merge internal and external candidates
                const allCandidates = [
                    ...cands.map((c: any) => ({
                        ...c,
                        appliedAt: new Date(c.appliedAt),
                        dateOfJoining: c.dateOfJoining ? new Date(c.dateOfJoining) : undefined
                    })),
                    ...externalCandidates
                ];

                setCandidates(allCandidates);
                setInterviews(ints.map((i: any) => ({
                    ...i,
                    scheduledAt: new Date(i.scheduledAt)
                })));
            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error('Failed to load recruitment data');
            }
        };
        fetchData();
    }, [isAuthenticated]);

    const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
        {
            id: 'round1',
            name: 'Round 1 - Technical Interview',
            subject: 'Interview Invitation - Round 1 - [Position]',
            body: `Dear [Candidate Name],

We are pleased to inform you that your application for the position of [Position] has been shortlisted.

We would like to invite you for Round 1 - Technical Interview / Coding with our team.

Interview Details:
━━━━━━━━━━━━━━━━━━━━━
📅 Date: [Date]
🕐 Time: [Time]
👤 Interviewer: [Interviewer]
 Your Resume: [Resume Link]
🔗 Meeting Link: [Link]
⏱️ Duration: 1 hour (approx.)

Interview Format:
━━━━━━━━━━━━━━━━━━━━━
This round will focus on:
• Technical assessment and coding challenges
• Discussion on your technical skills and experience
• Problem-solving exercises
• Code review and best practices

What to Prepare:
━━━━━━━━━━━━━━━━━━━━━
✓ Review fundamental concepts related to the position
✓ Practice coding problems
✓ Be ready to explain your previous projects
✓ Prepare questions about the role and team

Important Instructions:
━━━━━━━━━━━━━━━━━━━━━
✓ Please join the meeting 5 minutes prior to the scheduled time
✓ Ensure a stable internet connection
✓ Keep your resume and relevant documents handy
✓ Have a quiet environment for the interview
✓ Test your audio and video before the call

Please confirm your availability for this interview by replying to this email.

If you have any questions or need to reschedule, please feel free to contact us.

We look forward to meeting you!

Best regards,
HR Team / Recruitment Team

---
Note: This is an automated email. Please do not reply directly to this email.
For any queries, contact us at hr@company.com`
        },
        {
            id: 'round2',
            name: 'Round 2 - HR Interview',
            subject: 'Interview Invitation - Round 2 - [Position]',
            body: `Dear [Candidate Name],

Congratulations! You have successfully cleared Round 1 of the interview process.

We would like to invite you for Round 2 - Technical Interview / HR with our team for the position of [Position].

Interview Details:
━━━━━━━━━━━━━━━━━━━━━
📅 Date: [Date]
🕐 Time: [Time]
👤 Interviewer: [Interviewer]
 Your Resume: [Resume Link]
🔗 Meeting Link: [Link]
⏱️ Duration: 1 hour (approx.)

Interview Format:
━━━━━━━━━━━━━━━━━━━━━
This round will focus on:
• In-depth technical discussion
• System design and architecture
• HR round and cultural fit assessment
• Discussion on compensation and benefits
• Team expectations and work culture

What to Prepare:
━━━━━━━━━━━━━━━━━━━━━
✓ Be ready for advanced technical questions
✓ Prepare examples of your leadership experience
✓ Think about your career goals
✓ Prepare questions about company culture and growth opportunities
✓ Be ready to discuss salary expectations

Important Instructions:
━━━━━━━━━━━━━━━━━━━━━
✓ Please join the meeting 5 minutes prior to the scheduled time
✓ Ensure a stable internet connection
✓ Keep your resume and relevant documents handy
✓ Have a quiet environment for the interview
✓ Test your audio and video before the call

Please confirm your availability for this interview by replying to this email.

If you have any questions or need to reschedule, please feel free to contact us.

We are excited to move forward with your candidacy!

Best regards,
HR Team / Recruitment Team

---
Note: This is an automated email. Please do not reply directly to this email.
For any queries, contact us at hr@company.com`
        },
        {
            id: 'interview_reminder',
            name: 'Interview Reminder',
            subject: 'Interview Reminder: [Position] - Round [Round]',
            body: `Dear [Candidate Name],

This is a reminder for your upcoming interview scheduled on [Date] at [Time].

Position: [Position]
Round: [Round]
[Link]

Please ensure you are available 5 minutes before the scheduled time.

Best regards,
HR Team`
        },
        {
            id: 'demand_created',
            name: 'New Demand Notification',
            subject: '📢 New Job Demand Created',
            body: `Dear [User Name],

A new job demand has been created in the HireFlow system. Here are the details:

📋 Demand Information
===================
Title: [Title]
Role: [Role]
Experience: [Experience]
Location: [Location]
Openings: [Openings]
Status: [Status]
Created By: [Created By]
Created At: [Created At]

🔧 Required Skills
=================
[Skills]

📊 Next Steps
============
1. Review the demand details in HireFlow
2. Approve if necessary
3. Monitor candidate applications
4. Coordinate with hiring managers

🔗 Quick Links
=============
View Demand: [HireFlow Dashboard Link]
Admin Panel: [Admin Portal Link]

📞 Support
=========
For any questions, please contact the HR team or system administrator.

Best regards,
The HireFlow Team`
        },
        {
            id: 'candidate_rejection',
            name: 'Candidate Rejection',
            subject: 'Application Update - [Position] - GuhaTek',
            body: `Dear [Candidate Name],

Thanks for applying to join our team. After reviewing your application, we’ve decided to move forward with candidates whose skills and experience are more closely aligned with this particular role.

That said, we were impressed with your background, and we’d love to keep your profile on file for future opportunities.

Wishing you success ahead, and we appreciate your interest in GuhaTek.

Sincerely,
GuhaTek Recruitment Team`
        },
        {
            id: 'user_invite',
            name: 'User Invitation',
            subject: 'Invitation to join HireFlow - [Role]',
            body: `Dear [User Name],

You have been added as a [Role] to the HireFlow Recruitment Portal.

Your Access Details:
━━━━━━━━━━━━━━━━━━━━━
📧 Email: [Email]
👤 Role: [Role]
🔐 Login: Sign in with your Google account

Getting Started:
━━━━━━━━━━━━━━━━━━━━━
1. Click the Sign In button below
2. Use your Google account to authenticate
3. Start using HireFlow!

🔗 Sign In: [Portal Link]

Your Permissions:
━━━━━━━━━━━━━━━━━━━━━
[Permissions List]

If you have any questions or need assistance, please contact the Super Admin.

Best regards,
HireFlow Team

---
Note: This is an automated email from HireFlow.`
        },
    ]);

    const addCandidate = async (candidate: Candidate) => {
        try {
            const res = await fetch('/api/candidates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(candidate),
            });
            const newCand = await res.json();
            setCandidates((prev) => [{ ...newCand, appliedAt: new Date(newCand.appliedAt) }, ...prev]);
        } catch (error) {
            toast.error('Failed to add candidate');
        }
    };

    const addBenchResource = (resource: BenchResource) => {
        setBenchResources((prev) => [resource, ...prev]);
    };

    const updateBenchResource = (resource: BenchResource) => {
        setBenchResources((prev) => prev.map(r => r.id === resource.id ? resource : r));
    };

    const updateCandidateFeedback = async (candidateId: string, round: 1 | 2, recommendation: string) => {
        try {
            const updates: any = { id: candidateId };
            if (round === 1) updates.round1Recommendation = recommendation;
            else updates.round2Recommendation = recommendation;

            if (recommendation === 'reject') {
                updates.status = 'rejected';
            }

            const res = await fetch('/api/candidates/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (res.ok) {
                const updatedCand = await res.json();
                setCandidates((prev) =>
                    prev.map((c) => (c.id === candidateId ? { ...updatedCand, appliedAt: new Date(updatedCand.appliedAt) } : c))
                );
            }
        } catch (error) {
            toast.error('Failed to update candidate feedback');
        }
    };

    const updateCandidateStatus = async (candidateId: string, status: Candidate['status']) => {
        try {
            const res = await fetch('/api/candidates/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: candidateId, status }),
            });
            const updatedCand = await res.json();

            // Determine if we need to move to bench
            if (status === 'onboarded') {
                const candidate = candidates.find(c => c.id === candidateId);
                if (candidate && candidate.status !== 'onboarded') {
                    const newResource: BenchResource = {
                        id: String(benchResources.length + 1),
                        name: candidate.name,
                        email: candidate.email,
                        phone: candidate.phone,
                        role: 'Bench Resource',
                        skills: candidate.skills || [],
                        experience: candidate.experience || '0 years',
                        availableFrom: new Date(),
                        status: 'available',
                        location: candidate.location || 'Unknown',
                        expectedCTC: candidate.expectedCTC || '',
                        lastProject: '',
                    };
                    setBenchResources(prev => [newResource, ...prev]);
                    toast.success(`${candidate.name} has been moved to Bench Resources`);
                }
            }

            setCandidates((prev) =>
                prev.map((c) => (c.id === candidateId ? { ...updatedCand, appliedAt: new Date(updatedCand.appliedAt) } : c))
            );
        } catch (error) {
            toast.error('Failed to update candidate status');
        }
    };

    const updateCandidateOfferDetails = async (candidateId: string, updates: Partial<Pick<Candidate, 'offeredCTC' | 'offeredPosition' | 'dateOfJoining' | 'status' | 'experience' | 'currentCompany'>>) => {
        try {
            const res = await fetch('/api/candidates/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: candidateId, ...updates }),
            });

            if (res.ok) {
                const updatedCand = await res.json();
                setCandidates((prev) =>
                    prev.map((c) => (c.id === candidateId ? { ...updatedCand, appliedAt: new Date(updatedCand.appliedAt) } : c))
                );
                toast.success(`Candidate offer details updated`);
            }
        } catch (error) {
            toast.error('Failed to update offer details');
        }
    };

    const addInterview = async (interview: Omit<Interview, 'id'>) => {
        try {
            const res = await fetch('/api/interviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(interview),
            });

            if (res.ok) {
                const newInterview = await res.json();
                setInterviews((prev) => [...prev, { ...newInterview, scheduledAt: new Date(newInterview.scheduledAt) }]);

                // Automatically update candidate status and current round when an interview is scheduled
                const candidateUpdateRes = await fetch('/api/candidates/update', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: interview.candidateId,
                        status: 'interview_scheduled',
                        currentRound: interview.round
                    }),
                });

                if (candidateUpdateRes.ok) {
                    const updatedCand = await candidateUpdateRes.json();
                    setCandidates((prev) =>
                        prev.map((c) => (c.id === interview.candidateId ? { ...updatedCand, appliedAt: new Date(updatedCand.appliedAt) } : c))
                    );
                    toast.success(`Interview scheduled for ${interview.candidateName}`);
                } else {
                    toast.error('Failed to update candidate status after scheduling interview');
                }
            }
        } catch (error) {
            toast.error('Failed to schedule interview');
        }
    };

    const updateInterview = async (interviewId: string, updates: Partial<Interview>) => {
        try {
            const res = await fetch('/api/interviews', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: interviewId, ...updates }),
            });

            if (res.ok) {
                const updatedInt = await res.json();
                setInterviews((prev) =>
                    prev.map((i) => i.id === interviewId ? { ...updatedInt, scheduledAt: new Date(updatedInt.scheduledAt) } : i)
                );

                // If the interview status is updated to 'completed' or 'cancelled', update candidate's currentRound or status
                if (updates.status === 'completed' || updates.status === 'cancelled') {
                    const candidateUpdateRes = await fetch('/api/candidates/update', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: updatedInt.candidateId,
                            currentRound: updates.status === 'completed' ? updatedInt.round + 1 : updatedInt.round, // Move to next round if completed
                            status: updates.status === 'cancelled' ? 'interview_cancelled' : undefined // Update status if cancelled
                        }),
                    });

                    if (candidateUpdateRes.ok) {
                        const updatedCand = await candidateUpdateRes.json();
                        setCandidates((prev) =>
                            prev.map((c) => (c.id === updatedInt.candidateId ? { ...updatedCand, appliedAt: new Date(updatedCand.appliedAt) } : c))
                        );
                    }
                }
            }
        } catch (error) {
            toast.error('Failed to update interview');
        }
    };

    const cancelInterview = (interviewId: string) => {
        setInterviews((prev) =>
            prev.map((i) => i.id === interviewId ? { ...i, status: 'cancelled' as const } : i)
        );
        toast.info(`Interview has been cancelled`);
    };

    const saveScreeningFeedback = async (candidateId: string, feedback: string) => {
        try {
            const isRejected = feedback.toLowerCase().includes('reject');
            const res = await fetch('/api/candidates/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: candidateId,
                    screeningFeedback: feedback,
                    status: isRejected ? 'rejected' : undefined
                }),
            });

            if (res.ok) {
                const updatedCand = await res.json();
                setCandidates((prev) =>
                    prev.map((c) => (c.id === candidateId ? { ...updatedCand, appliedAt: new Date(updatedCand.appliedAt) } : c))
                );
                toast.success('Initial screening feedback saved');
            }
        } catch (error) {
            toast.error('Failed to save screening feedback');
        }
    };

    const updateCandidateOnboardingTask = async (candidateId: string, taskId: string, completed: boolean) => {
        try {
            const candidate = candidates.find(c => c.id === candidateId);
            if (!candidate) return;

            const updatedTasks = (candidate.onboardingTasks || []).map(task =>
                task.id === taskId ? { ...task, completed } : task
            );

            // Calculate overall status
            const completedCount = updatedTasks.filter(t => t.completed).length;
            let onboardingStatus: Candidate['onboardingStatus'] = 'pending';
            if (completedCount === updatedTasks.length && updatedTasks.length > 0) {
                onboardingStatus = 'completed';
            } else if (completedCount > 0) {
                onboardingStatus = 'in_progress';
            }

            const res = await fetch('/api/candidates/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: candidateId,
                    onboardingTasks: updatedTasks,
                    onboardingStatus
                }),
            });

            if (res.ok) {
                const updatedCand = await res.json();
                setCandidates((prev) =>
                    prev.map((c) => (c.id === candidateId ? { ...updatedCand, appliedAt: new Date(updatedCand.appliedAt) } : c))
                );
            }
        } catch (error) {
            console.error('Failed to update onboarding task:', error);
            toast.error('Failed to update task');
        }
    };

    const updateCandidate = async (candidateId: string, updates: Partial<Candidate>) => {
        try {
            const res = await fetch('/api/candidates/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: candidateId, ...updates }),
            });

            if (res.ok) {
                const updatedCand = await res.json();
                setCandidates((prev) =>
                    prev.map((c) => (c.id === candidateId ? { ...updatedCand, appliedAt: new Date(updatedCand.appliedAt) } : c))
                );
                toast.success('Candidate updated successfully');
            } else {
                throw new Error('Failed to update candidate');
            }
        } catch (error) {
            console.error('Failed to update candidate:', error);
            toast.error('Failed to update candidate');
        }
    };

    const deleteCandidate = (candidateId: string) => {
        setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
        toast.success('Candidate removed from view');
    };

    const sendEmail = async (to: string, subject: string, html: string) => {
        try {
            const res = await fetch('/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to, subject, html }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Email sent successfully');
                return { success: true };
            } else {
                throw new Error(data.error || 'Failed to send email');
            }
        } catch (error) {
            console.error('Failed to send email:', error);
            toast.error('Failed to send email');
            return { success: false, error };
        }
    };

    const updateInterviewStatus = (candidateId: string, status: Candidate['interviewStatus']) => {
        setCandidates((prev) =>
            prev.map((c) => (c.id === candidateId ? { ...c, interviewStatus: status } : c))
        );
        toast.success('Interview status updated');
    };

    const updateEmailTemplate = (templateId: string, updates: Partial<EmailTemplate>) => {
        setEmailTemplates((prev) =>
            prev.map((t) => (t.id === templateId ? { ...t, ...updates } : t))
        );
        toast.success('Email template updated successfully');
    };

    return (
        <RecruitmentContext.Provider value={{
            candidates,
            filteredCandidates,
            benchResources,
            interviews,
            filteredInterviews,
            updateCandidateStatus,
            updateCandidateFeedback,
            addCandidate,
            addBenchResource,
            updateBenchResource,
            addInterview,
            updateInterview,
            cancelInterview,
            saveScreeningFeedback,
            updateInterviewStatus,
            updateCandidateOfferDetails,
            updateCandidateOnboardingTask,
            updateCandidate,
            deleteCandidate,
            sendEmail,
            emailTemplates,
            updateEmailTemplate
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
