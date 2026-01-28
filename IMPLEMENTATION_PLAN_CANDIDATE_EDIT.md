# Implementation Plan - Candidate Edit Feature

Add an edit option to the candidate profile to allow users to update candidate details.

## Proposed Changes

### [Recruitment Context]

#### [MODIFY] [RecruitmentContext.tsx](file:///d:/New%20folder/hireflow-portal/src/context/RecruitmentContext.tsx)
- Add `updateCandidate` to `RecruitmentContextType`.
- Implement `updateCandidate`:
  - Use `PATCH` request to `/api/candidates/update`.
  - Update the local `candidates` state.

### [UI Components]

#### [MODIFY] [CandidateProfileDialog.tsx](file:///d:/New%20folder/hireflow-portal/src/components/dialogs/CandidateProfileDialog.tsx)
- Add an `onEdit` prop.
- Add an "Edit Profile" button (using `Edit2` icon from `lucide-react`) near the candidate's name.

#### [MODIFY] [Candidates.tsx](file:///d:/New%20folder/hireflow-portal/src/legacy-pages/Candidates.tsx)
- Add `isEditMode` state (`boolean`).
- Implement `handleEditCandidate` (passed to `CandidateProfileDialog`):
  - Pre-populate `newCandidateData` with current candidate fields.
  - Set `isEditMode(true)`.
  - Open the `isAddCandidateOpen` dialog.
- Update the `Add Candidate` dialog JSX:
  - Change title to "Edit Candidate" if `isEditMode` is true.
  - Change button label to "Save Changes" if `isEditMode` is true.
- Update `handleAddCandidate` logic:
  - If `isEditMode`, call `updateCandidate`.
  - Reset `isEditMode` to `false` and clear form on close/success.

## Verification Plan

### Manual Verification
1.  **Open Profile**: Navigate to the Candidates page and click on a candidate (e.g., "Priya Sharma").
2.  **Click Edit**: Click the new "Edit Profile" button.
3.  **Update Details**: Change the email, phone, or current role in the form.
4.  **Save**: Click "Save Changes".
5.  **Verify UI**: Ensure the profile dialog and the candidate table reflect the updated information.
6.  **Verify Persistence**: Refresh the page and ensure the changes are still there.
