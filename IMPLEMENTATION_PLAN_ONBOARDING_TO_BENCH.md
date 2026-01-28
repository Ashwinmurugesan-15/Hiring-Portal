# Implementation Plan - Move Onboarding Candidates to Bench

## Current Behavior
The system already moves candidates to Bench Resources when their status is set to `'onboarded'` (after onboarding is complete).

## User Request
Move candidates to Bench when status is set to `'onboarding'` (when onboarding starts).

## Question for User

> [!IMPORTANT]
> Please clarify when exactly you want candidates to be moved to Bench Resources:
> 1. **When onboarding starts** (`'onboarding'` status) - candidate just arrived
> 2. **When onboarding completes** (`'onboarded'` status) - this already works!

## Proposed Changes (if option 1)

### [MODIFY] [RecruitmentContext.tsx](file:///d:/New%20folder/hireflow-portal/src/context/RecruitmentContext.tsx)

Change line 325 from:
```typescript
if (status === 'onboarded')
```
to:
```typescript
if (status === 'onboarding')
```

This will move candidates to bench as soon as they start onboarding instead of after completion.
