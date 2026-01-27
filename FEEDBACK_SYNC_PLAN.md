# Syncing Candidate Status with Interview Feedback

The goal is to ensure that when an interviewer recommends "Reject" during feedback submission, the candidate's application status is automatically updated to "Rejected". This will ensure that dashboard stats remain accurate and synchronized with the interview process.

## Proposed Changes

### [Interviews Page]
#### [MODIFY] [Interviews.tsx](file:///d:/New%20folder/hireflow-portal/src/pages/Interviews.tsx)
- In `handleSubmitFeedback`, call `updateCandidateStatus(candidateId, 'rejected')` if the recommendation is `reject`.

### [Dashboard Page]
#### [MODIFY] [Dashboard.tsx](file:///d:/New%20folder/hireflow-portal/src/pages/Dashboard.tsx)
- Update `round1Rejected` and `round2Rejected` calculations to count candidates who have a "reject" recommendation in the respective round, even if their top-level status hasn't synced yet.
- Update `totalRejected` to include candidates with reject recommendations.

## Verification Plan

### Manual Verification
1. Open the **Interviews** page.
2. Submit a "Reject" recommendation for a Round 1 interview.
3. Verify that the candidate's status on the **Candidates** page changes to "Rejected".
4. Verify that the **Dashboard**'s "Round 1 Rejection %" and "Candidates Rejected" count update correctly.
5. Verify for Round 2 as well.
