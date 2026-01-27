import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Candidate, BenchResource, Interview, EmailTemplate } from '@/types/recruitment';
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
    saveScreeningFeedback: (candidateId: string, feedback: string) => void;
    updateInterviewStatus: (candidateId: string, status: Candidate['interviewStatus']) => void;
    updateCandidateOfferDetails: (candidateId: string, updates: Partial<Pick<Candidate, 'offeredCTC' | 'offeredPosition' | 'dateOfJoining' | 'status' | 'experience' | 'currentCompany'>>) => void;
    emailTemplates: EmailTemplate[];
    updateEmailTemplate: (templateId: string, updates: Partial<EmailTemplate>) => void;
}

const RecruitmentContext = createContext<RecruitmentContextType | undefined>(undefined);

export const RecruitmentProvider = ({ children }: { children: ReactNode }) => {
    const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
    const [benchResources, setBenchResources] = useState<BenchResource[]>(mockBenchResources);
    const [interviews, setInterviews] = useState<Interview[]>(mockInterviews);
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
� Your Resume: [Resume Link]
�🔗 Meeting Link: [Link]
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
� Your Resume: [Resume Link]
�🔗 Meeting Link: [Link]
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
    ]);

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

    const updateCandidateOfferDetails = (candidateId: string, updates: Partial<Pick<Candidate, 'offeredCTC' | 'offeredPosition' | 'dateOfJoining' | 'status' | 'experience' | 'currentCompany'>>) => {
        setCandidates((prev) =>
            prev.map((c) => (c.id === candidateId ? { ...c, ...updates } : c))
        );
        toast.success(`Candidate offer details updated`);
    };

    const addInterview = (interview: Omit<Interview, 'id'>) => {
        const newInterview: Interview = {
            ...interview,
            id: String(interviews.length + 1),
        };
        setInterviews((prev) => [...prev, newInterview]);

        // Automatically update candidate status and current round when an interview is scheduled
        setCandidates((prev) =>
            prev.map((c) => (c.id === interview.candidateId ? { ...c, status: 'interview_scheduled', currentRound: interview.round } : c))
        );

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

    const saveScreeningFeedback = (candidateId: string, feedback: string) => {
        setCandidates((prev) =>
            prev.map((c) => (c.id === candidateId ? { ...c, screeningFeedback: feedback } : c))
        );
        toast.success('Initial screening feedback saved');
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
            benchResources,
            interviews,
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
