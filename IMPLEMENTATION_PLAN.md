# Candidate Table Enhancements & Profile Flow Update

Enhance the candidate management experience by improving table usability, standardizing statuses, and streamlining the screening process.

## Proposed Changes

### [Recruitment Context & Types]

#### [MODIFY] [recruitment.ts](file:///d:/New%20folder/hireflow-portal/src/types/recruitment.ts)
- Standardize `CandidateStatus` values.
- Ensure `screeningFeedback` property is correctly typed.

#### [MODIFY] [RecruitmentContext.tsx](file:///d:/New%20folder/hireflow-portal/src/context/RecruitmentContext.tsx)
- Implement `updateCandidateStatus` function to handle status transitions.
- Ensure `saveScreeningFeedback` is robust.

### [Candidate Table]

#### [MODIFY] [CandidateTable.tsx](file:///d:/New%20folder/hireflow-portal/src/components/candidates/CandidateTable.tsx)
- Implement sticky columns for the first three columns (Full Name, Email, Phone).
- Replace static status text with an inline `Select` dropdown for quick status updates.
- Ensure the "Initial Screening" column displays feedback and provides an edit trigger.

### [Candidate Profile]

#### [MODIFY] [CandidateProfileDialog.tsx](file:///d:/New%20folder/hireflow-portal/src/components/dialogs/CandidateProfileDialog.tsx)
- Add "View Resume" action.
- Add "Move Forward" and "Reject" buttons.
- Implement logic to auto-transition status from "Applied" to "Proceed Further" on "Move Forward".

## Verification Plan

### Automated Tests
- N/A (No existing test suite mentioned, but will verify via manual browser testing).

### Manual Verification
1.  **Sticky Columns**: Scroll horizontally in the Candidate Table and verify Name, Email, and Phone stay fixed.
2.  **Inline Status**: Change a candidate's status via the dropdown in the table and verify it persists.
3.  **Initial Screening**: Add/Edit feedback and verify it shows up in the new column.
4.  **Profile Actions**: Open a profile, click "Move Forward", and verify the status updates automatically.
5.  **View Resume**: Click "View Resume" and ensure it attempts to open the URL.
