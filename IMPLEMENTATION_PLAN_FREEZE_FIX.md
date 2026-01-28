# Implementation Plan: Fix UI Freeze After Interview Scheduling

## Proposed Changes
1. **dialog.tsx**: Add global `cleanupOrphanedPortals` to restore body styles and remove stale portals.
2. **dropdown-menu.tsx**: Ensure body styles are restored when the menu closes.
3. **ScheduleInterviewDialog.tsx**: Aggressively remove leftover portals on close.

## Verification
- Manual verification of the scheduling flow.
