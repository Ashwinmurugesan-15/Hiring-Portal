import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { guhatekApi } from '@/lib/guhatek-api';
import { apiCache } from '@/lib/api-cache';

export async function GET() {
    try {
        // Try fetching from cache first
        const cacheKey = 'candidates_list';
        const cachedData = apiCache.get(cacheKey);
        if (cachedData) {
            console.log('[API] Returning cached candidates');
            return NextResponse.json(cachedData);
        }

        // Try fetching from API first
        try {
            const apiApplications = await guhatekApi.getApplications();
            // Map API data to Candidate format
            const apiCandidates = apiApplications.map((app: any) => {
                // Parse feedback JSONs if they exist
                let r1FeedbackObj: any = {};
                let r2FeedbackObj: any = {};
                try {
                    if (app.round1_feedback) r1FeedbackObj = JSON.parse(app.round1_feedback);
                    if (app.round2_feedback) r2FeedbackObj = JSON.parse(app.round2_feedback);
                } catch (e) {
                    // If not JSON, maybe treat as raw string or ignore
                    console.warn('Failed to parse feedback JSON for', app.id);
                }

                // Determine current round based on feedback presence
                let currentRound = 1;
                if (app.round2_feedback || app.round1_feedback && r1FeedbackObj.recommendation === 'proceed_to_round2') {
                    currentRound = 2;
                }
                if (app.application_status === 'scheduled' || app.application_status === 'interview_scheduled') {
                    // If status says scheduled, we might be pending interview
                }

                return {
                    id: app.id,
                    name: app.full_name || app.name || 'Unknown',
                    email: app.email,
                    phone: app.contact_number || app.phone,
                    demandId: app.interested_position ? app.interested_position.toLowerCase().replace(/ /g, '-') : 'unknown',
                    role: app.interested_position || app.role,
                    status: app.application_status || 'applied',
                    appliedAt: app.submitted_at || app.applied_at || new Date().toISOString(),
                    skills: [app.interested_position || 'General'],
                    experience: app.total_experience ? `${app.total_experience} years` : 'External',
                    location: app.current_location || 'Remote',
                    source: 'Guhatek API',
                    resumeUrl: app.resume_url,

                    // Map Feedback Fields
                    round1Feedback: app.round1_feedback,
                    round1Recommendation: r1FeedbackObj.recommendation,
                    round2Feedback: app.round2_feedback,
                    round2Recommendation: r2FeedbackObj.recommendation,
                    clientFeedback: app.client_feedback,
                    clientRecommendation: (() => {
                        try {
                            return app.client_feedback ? JSON.parse(app.client_feedback).recommendation : undefined;
                        } catch (e) { return undefined; }
                    })(),

                    currentRound: currentRound,
                    interviewStatus: 'pending', // Defaulting for now, ideally derived from interview tables or status

                    screeningFeedback: app.initial_screening
                };
            });

            // Also read local DB for locally created candidates
            const db = await readDb();
            const localCandidates = db.candidates || [];

            // Merge: Prefer API, but enrich with local metadata (feedback, etc.)
            const combined = apiCandidates.map(ac => {
                const local = localCandidates.find((lc: any) => lc.id === ac.id);
                if (local) {
                    return {
                        ...ac,
                        // Preserve locally-stored feedback/recommendations for API candidates
                        round1Feedback: local.round1Feedback || ac.round1Feedback,
                        round1Recommendation: local.round1Recommendation || ac.round1Recommendation,
                        round2Feedback: local.round2Feedback || ac.round2Feedback,
                        round2Recommendation: local.round2Recommendation || ac.round2Recommendation,
                        clientFeedback: local.clientFeedback || ac.clientFeedback,
                        clientRecommendation: local.clientRecommendation || ac.clientRecommendation,
                        screeningFeedback: local.screeningFeedback || ac.screeningFeedback,
                        currentRound: local.currentRound || ac.currentRound,
                        interviewStatus: local.interviewStatus || ac.interviewStatus,
                        status: local.status || ac.status
                    };
                }
                return ac;
            });

            const apiIds = new Set(apiCandidates.map(c => c.id));
            localCandidates.forEach((lc: any) => {
                if (!apiIds.has(lc.id)) {
                    combined.push(lc);
                }
            });

            apiCache.set(cacheKey, combined);
            return NextResponse.json(combined);

        } catch (apiError: any) {
            console.warn(`⚠️ API fetch failed (${apiError.status || 'Connection Error'}), falling back to local DB`);
            const db = await readDb();
            return NextResponse.json(db.candidates || []);
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const db = await readDb();
        const candidate = await request.json();
        db.candidates.push(candidate);
        await writeDb(db);
        apiCache.clear('candidates_list');
        return NextResponse.json(candidate, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add candidate' }, { status: 500 });
    }
}
