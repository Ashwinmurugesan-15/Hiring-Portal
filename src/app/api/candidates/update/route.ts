import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

import { guhatekApi } from '@/lib/guhatek-api';
import { apiCache } from '@/lib/api-cache';

export async function PATCH(request: Request) {
    try {
        const updates = await request.json();
        const { id, ...rest } = updates;

        // Map UI fields to API fields
        const apiUpdates: any = {};

        // API expects snake_case for feedback and status fields
        if (rest.round1Feedback) apiUpdates.round1_feedback = rest.round1Feedback;
        if (rest.round2Feedback) apiUpdates.round2_feedback = rest.round2Feedback;
        if (rest.clientFeedback) apiUpdates.client_feedback = rest.clientFeedback;

        // Fallback or legacy handling
        if (!apiUpdates.round1_feedback && rest.round1Recommendation) {
            apiUpdates.round1_feedback = JSON.stringify({ recommendation: rest.round1Recommendation });
        }
        if (!apiUpdates.round2_feedback && rest.round2Recommendation) {
            apiUpdates.round2_feedback = JSON.stringify({ recommendation: rest.round2Recommendation });
        }
        if (!apiUpdates.client_feedback && rest.clientRecommendation) {
            apiUpdates.client_feedback = JSON.stringify({ recommendation: rest.clientRecommendation });
        }

        // Map status
        if (rest.status) apiUpdates.application_status = rest.status;
        if (rest.interviewStatus) apiUpdates.interview_status = rest.interviewStatus;

        console.log(`[API UPDATE] Candidate ${id} incoming values:`, JSON.stringify(rest));
        console.log(`[API UPDATE] Mapped to Guhatek fields:`, JSON.stringify(apiUpdates));

        // Try updating via API
        try {
            await guhatekApi.updateApplication(id, apiUpdates);
            apiCache.clear('candidates_list');
            return NextResponse.json({ success: true, ...updates });
        } catch (apiError: any) {
            console.warn('API update failed, trying local DB:', apiError.message);

            // Fallback to local DB
            const db = await readDb();
            const index = db.candidates.findIndex((c: any) => c.id === id);

            if (index === -1) {
                // If not in DB, create it (Upsert)
                const newCandidate = {
                    id,
                    ...rest,
                    // Ensure minimal required fields for a valid candidate record if they are missing
                    name: rest.fullName || rest.name || 'Unknown',
                    email: rest.email || '',
                    status: rest.status || 'applied',
                    appliedAt: new Date().toISOString()
                };
                db.candidates.push(newCandidate);
                await writeDb(db);
                apiCache.clear('candidates_list');
                return NextResponse.json(newCandidate);
            }

            db.candidates[index] = { ...db.candidates[index], ...rest };
            await writeDb(db);
            apiCache.clear('candidates_list');
            return NextResponse.json(db.candidates[index]);
        }

    } catch (error) {
        console.error('Update Candidate Error:', error);
        return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
    }
}
