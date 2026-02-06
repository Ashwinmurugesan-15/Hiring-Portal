import { Candidate, Interview, User } from '@/types/recruitment';

/**
 * Filters candidates based on user role and permissions
 * - Super Admin / Admin: See all candidates
 * - Interviewer: Only see candidates where interviewer email matches their login email
 * - Hiring Manager: See all candidates
 */
export const getFilteredCandidatesForUser = (
    candidates: Candidate[],
    interviews: Interview[],
    user: User | null
): Candidate[] => {
    console.log('[Filter Debug] getFilteredCandidatesForUser called');
    console.log('[Filter Debug] User object:', user);
    console.log('[Filter Debug] User role:', user?.role);
    console.log('[Filter Debug] User email:', user?.email);

    if (!user) return [];

    // Super Admin and Admin see all candidates
    if (user.role === 'super_admin' || user.role === 'admin' || user.role === 'hiring_manager') {
        console.log('[Filter Debug] User is admin/super_admin/hiring_manager - showing all candidates');
        return candidates;
    }

    // Interviewers only see their assigned candidates
    if (user.role === 'interviewer') {
        console.log('[Filter Debug] Interviewer login detected:', user.email);
        console.log('[Filter Debug] Total interviews:', interviews.length);
        console.log('[Filter Debug] All interviews:', interviews.map(i => ({
            candidateId: i.candidateId,
            interviewerEmail: i.interviewerEmail
        })));

        // Get all interviews where the interviewer email matches the logged-in user's email
        const userInterviews = interviews.filter(
            interview => interview.interviewerEmail?.toLowerCase() === user.email.toLowerCase()
        );

        console.log('[Filter Debug] Matched interviews for', user.email, ':', userInterviews.length);
        console.log('[Filter Debug] Matched interview details:', userInterviews);

        // Extract unique candidate IDs
        const assignedCandidateIds = new Set(
            userInterviews.map(interview => interview.candidateId)
        );

        console.log('[Filter Debug] Assigned candidate IDs:', Array.from(assignedCandidateIds));

        // Filter candidates to only those assigned to this interviewer
        const filtered = candidates.filter(candidate =>
            assignedCandidateIds.has(candidate.id)
        );

        console.log('[Filter Debug] Filtered candidates count:', filtered.length);
        return filtered;
    }

    return candidates;
};

/**
 * Filters interviews based on user role and permissions
 * - Super Admin / Admin: See all interviews
 * - Interviewer: Only see interviews where interviewer email matches their login email
 * - Hiring Manager: See all interviews
 */
export const getFilteredInterviewsForUser = (
    interviews: Interview[],
    user: User | null
): Interview[] => {
    if (!user) return [];

    // Super Admin, Admin, and Hiring Manager see all interviews
    if (user.role === 'super_admin' || user.role === 'admin' || user.role === 'hiring_manager') {
        return interviews;
    }

    // Interviewers only see their assigned interviews
    if (user.role === 'interviewer') {
        return interviews.filter(
            interview => interview.interviewerEmail?.toLowerCase() === user.email.toLowerCase()
        );
    }

    return interviews;
};
