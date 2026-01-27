# Candidate Table and Profile Enhancements Walkthrough

I have enhanced the candidate management experience with sticky columns, inline status editing, and improved profile actions.

## Key Enhancements

### 1. Sticky Candidate Table Columns
The first three columns (**Full Name**, **Email ID**, and **Contact Number**) are now sticky, allowing you to maintain context while scrolling horizontally.

### 2. Inline Application Status Editing
Replaced static status badges with an editable dropdown in the candidate table. This allows for quick status updates directly from the pipeline view.

### 3. Enhanced Candidate Profile Dialog
Added several actions within the candidate profile view:
- **View Resume**: Click to open the candidate's CV directly.
- **Move Forward**: Advance the candidate to the next stage. Moving a candidate from "Applied" now automatically updates their status to "Proceed Further".
- **Reject**: Quickly mark a candidate as rejected.

### 4. Initial Screening Column
A new "Initial Screening" column has been added to the table. You can enter and view feedback (up to 120 characters) directly in the pipeline.

### 5. Standardized Status Labels
All application statuses have been standardized across the application:
- `applied` → **Received**
- `screening` → **Proceed Further**
- `interview_scheduled` → **On Hold**
- `interview_completed` → **No Resp Call/Email**
- `selected` → **Accepted**
- `rejected` → **Rejected**
- `offer_rolled` → **Sent**
- `offer_accepted` → **In Notice**
- `offer_rejected` → **Did Not Join**
- `onboarding` → **Onboarding**
- `onboarded` → **Joined**

### 6. New Interview Status Column
Added a dedicated "Interview Status" column before the "Application Status" column. This allows tracking the specific stage of the interview process with an inline dropdown.

#### Interview Stages Included:
- **Applied**
- **Profile Screening Comp**
- **Voice Screening Comp**
- **Tech Inter Sched / Comp**
- **Code Inter Sched / Comp**
- **HR Inter Sched / Comp**
- **Offer**
- **Pending Final Noti**
- **Referances**
- **All Completed**

Each stage has distinct color coding for easy identification within the pipeline.

## Verification Results

Manual verification confirmed:
- Horizontal scrolling maintains stickiness of contact details.
- Status changes (both Application and Interview Status) via the table dropdowns update the candidate state and persist.
- Clicking "Move Forward" in the profile dialog correctly triggers the "Move Forward" dialog and auto-updates status when applicable.
- Initial screening feedback is correctly limited to 120 characters and displays in the table.
- All new interview status labels match the requested design and branding.
