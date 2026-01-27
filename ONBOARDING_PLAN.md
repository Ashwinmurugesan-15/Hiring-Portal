# Adding Edit Functionality to Onboarding Details

The goal is to allow users to edit the core details of a candidate during the onboarding process. This includes Position, Department, Joining Date, and Reporting Manager.

## Proposed Changes

### Onboarding Component
#### [MODIFY] [Onboarding.tsx](file:///d:/New%20folder/hireflow-portal/src/pages/Onboarding.tsx)
- Add `isEditOpen` state to control the visibility of the Edit Dialog.
- Add an "Edit Details" button to the `Details Dialog` footer.
- Implement an `Edit Dialog` that allows updating:
    - Position
    - Department
    - Joining Date
    - Reporting Manager
    - Experience
    - Previous Organization
- Implement `handleUpdateCandidate` to persist changes back to the local `candidates` state.

## Verification Plan

### Manual Verification
1. Open the Onboarding page.
2. Click on a candidate card to open the Details Dialog.
3. Click the "Edit Details" button.
4. Modify the candidate's joining date and reporting manager.
5. Click "Save Changes".
6. Verify that the details are updated in both the Details Dialog and the main card view.
