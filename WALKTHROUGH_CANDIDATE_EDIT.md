# Walkthrough - Candidate Edit Feature

I have added the ability to edit candidate details directly from their profile. This feature is integrated with the backend for persistent storage.

## Changes Made

### Recruitment Context
- Added a generic `updateCandidate` function to `RecruitmentContext.tsx` that handles `PATCH` requests to `/api/candidates/update`.
- This ensures that any changes made to a candidate's profile are saved to `db.json` and persist across reloads.

### Candidate Profile Dialog
- Added an **Edit Profile** button (represented by a pencil icon ✎) in the [Candidate Profile Dialog](file:///d:/New%20folder/hireflow-portal/src/components/dialogs/CandidateProfileDialog.tsx).
- When clicked, it opens the candidate form pre-filled with the candidate's existing information.

### Candidates Page
- Refactored the "Add Candidate" dialog in [Candidates.tsx](file:///d:/New%20folder/hireflow-portal/src/legacy-pages/Candidates.tsx) to support both adding and editing.
- Added logic to handle the transition between "Add" and "Edit" modes, ensuring the form resets correctly.

## Verification Results

### Automated Tests
- Ran `npx tsc --noEmit` which passed with **0 errors**, confirming type safety for the new props and state.

### Visual Verification
- Verified that the "Edit Profile" button appears only when appropriate.
- Confirmed that the form correctly pre-populates and updates the UI/backend upon saving.
