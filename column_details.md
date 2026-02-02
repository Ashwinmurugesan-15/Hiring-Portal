# Helper: Column Details & Data Requirements

Here is the rough list of column details required for the requested modules.

## 1. Create / Reopen Demand
Fields required when creating or reopening a job demand.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| **Job Title** | Text | e.g., "Senior React Developer" |
| **Role/Position** | Text | e.g., "Frontend Engineer" |
| **Experience** | Text/Number | e.g., "3-5 Years" |
| **Location** | Text | e.g., "Remote", "New York", "Bangalore" |
| **Openings** | Number | Number of vacancies (e.g., 2) |
| **Skills** | Tags/Array | List of required skills (e.g., "React", "Node.js") |
| **Job Description** | Rich Text | Detailed responsibilities and requirements. |
| **Salary Range** | Text | Min-Max CTC config. |
| **Detailed Date & Time** | DateTime | Required for "Reopen" to track exact timing. |
| **Priority** | Select | High, Medium, Low. |
| **Status** | Status | Open, Closed, On Hold. |

## 2. Scheduling a Meeting (Interview)
Details needed when scheduling an interview round.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| **Candidate** | Link/Text | Name of the candidate. |
| **Job ID / Demand** | Link | Position they are applying for. |
| **Interviewer** | User Select | Who will conduct the interview. |
| **Interview Round** | Select | Round 1, Round 2, HR Round, etc. |
| **Date & Time** | DateTime | Scheduled start time. |
| **Duration** | Number | Duration in minutes (default 30/60). |
| **Meeting Mode** | Select | Google Meet, Zoom, In-person, Telephonic. |
| **Meeting Link** | URL | Link to join the call. |
| **Status** | Status | Scheduled, Completed, Cancelled, No Show. |

## 3. User Management
Details for the User Administration table.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| **Full Name** | Text | Name of the system user. |
| **Email Address** | Email | Corporate email ID (Login ID). |
| **Role** | Select | Super Admin, Admin (HR), Hiring Manager, Interviewer. |
| **Status** | Toggle | Active / Inactive. |
| **Departments** | Tags | Linked departments (e.g., Engineering, Sales). |
| **Last Active** | DateTime | Last login timestamp. |
| **Actions** | Buttons | Edit, Deactivate, Reset Permissions. |

## 4. Feedback Tables
Columns for the Interview Feedback storage.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| **Candidate** | Link | Link to candidate profile. |
| **Round** | Text | e.g., "Technical R1". |
| **Interviewer** | Text | Name of the evaluator. |
| **Technical Rating** | Number (1-5) | Score for technical skills. |
| **Comm. Rating** | Number (1-5) | Score for communication/soft skills. |
| **Strong Areas** | Text | What went well. |
| **Areas of Improv.** | Text | Weaknesses/Gaps. |
| **Comments** | Text Area | Detailed feedback notes. |
| **Decision** | Select | Move Forward, Reject, Hold. |
| **Submitted At** | DateTime | When the feedback was recorded. |

## 5. Onboarding List
Tracking candidates who have accepted offers.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| **Candidate Name** | Text | Name of the joiner. |
| **Role** | Text | Position joining for. |
| **Offer Acceptance** | Date | When they accepted the offer. |
| **Joining Date** | Date | Expected joining date. |
| **Status** | Status | Documentation, IT Setup, Orientation, Completed. |
| **Docs Verified** | Checkbox | Have all documents been verified? |
| **Assets Assigned** | Checkbox | Laptop/ID Card issued? |
| **Tasks Completed** | Progress | e.g., "3/5 Tasks" (Email created, Slack invite, etc.). |
