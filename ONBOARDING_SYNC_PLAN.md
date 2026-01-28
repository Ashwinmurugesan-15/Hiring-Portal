# Implementation Plan: Onboarding - Candidate Synchronization

This plan synchronizes the Onboarding page with the main Candidates list, ensuring that any candidate marked for "Onboarding" automatically appears in the onboarding pipeline.

## Proposed Changes

### [Data Model]

#### [MODIFY] [recruitment.ts](file:///d:/New%20folder/hireflow-portal/src/types/recruitment.ts)
- Add `OnboardingTask` interface.
- Add `onboardingTasks` (optional) to the `Candidate` interface.
- Add `onboardingStatus` (optional) to the `Candidate` interface (`'pending' | 'in_progress' | 'completed'`).

### [Database]

#### [MODIFY] [db.json](file:///d:/New%20folder/hireflow-portal/src/data/db.json)
- Add initial `onboardingTasks` and `onboardingStatus` for existing onboarding candidates (if any).

### [Context]

#### [MODIFY] [RecruitmentContext.tsx](file:///d:/New%20folder/hireflow-portal/src/context/RecruitmentContext.tsx)
- Add `updateCandidateOnboardingTask` function to persist task completion to the backend.

### [UI]

#### [MODIFY] [Onboarding.tsx](file:///d:/New%20folder/hireflow-portal/src/legacy-pages/Onboarding.tsx)
- Remove hardcoded `initialCandidates`.
- Use `useRecruitment` hook to fetch candidates.
- Filter candidates with status `onboarding` or `onboarded`.
- Map the candidates to the onboarding UI structure.
- Update task completion logic to call the context's new persistence function.

## Verification Plan

### Manual Verification
1.  **Selection**: Go to the Candidates page, select a candidate, and change their status to "Onboarding".
2.  **Appearance**: Navigate to the Onboarding page and verify the candidate now appears in the "Pending" list.
3.  **Tasks**: Open the candidate's onboarding details, check a few tasks, and refresh the page.
4.  **Persistence**: Verify that the checked tasks remain completed after the refresh.
5.  **Completion**: Check all tasks and verify the candidate's onboarding status moves to "Completed".
