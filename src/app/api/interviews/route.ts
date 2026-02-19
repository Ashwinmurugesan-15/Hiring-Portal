import { NextResponse } from 'next/server';
import { guhatekApi } from '@/lib/guhatek-api';
import { apiCache } from '@/lib/api-cache';
import { readDb, writeDb } from '@/lib/db';

export async function GET() {
    try {
        const cacheKey = 'interviews_list';
        const cachedData = apiCache.get(cacheKey);
        if (cachedData) {
            console.log('[API] Returning cached interviews');
            return NextResponse.json(cachedData);
        }

        try {
            const interviews = await guhatekApi.getScheduledMeetings();
            apiCache.set(cacheKey, interviews);
            return NextResponse.json(interviews);
        } catch (error: any) {
            if (error.status !== 404) {
                console.error('Error fetching interviews from API:', error.message);
            }

            // Fallback to local DB (standardizing fallback for all API issues)
            console.warn(`⚠️ API issue (${error.status || 'Connection Failed'}), falling back to local DB for interviews`);
            const db = await readDb();
            const localInterviews = db.interviews || [];
            apiCache.set(cacheKey, localInterviews);
            return NextResponse.json(localInterviews);
        }
    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to fetch interviews',
            details: error.message
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const meetingData = await request.json();

        // Ensure meetingData matches ScheduleMeetingData interface
        const response = await guhatekApi.scheduleMeet(meetingData);

        if (response.success) {
            return NextResponse.json({ id: response.id, ...meetingData }, { status: 201 });
        } else {
            // Fallback to local DB on 404
            if (response.status === 404) {
                console.log('⚠️ API scheduleMeet not found (404), saving to local DB');
                const db = await readDb();
                const id = Date.now().toString();
                const newInterview = { id, ...meetingData, createdAt: new Date().toISOString() };
                db.interviews.push(newInterview);
                await writeDb(db);
                apiCache.clear('interviews_list');
                return NextResponse.json(newInterview, { status: 201 });
            }

            return NextResponse.json({ error: response.message || response.error || 'Failed to schedule interview' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Error scheduling interview:', error);
        return NextResponse.json({
            error: 'Failed to add interview',
            details: error.message
        }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const updates = await request.json();
        const { id, ...rest } = updates;

        if (!id) {
            return NextResponse.json({ error: 'Interview ID is required' }, { status: 400 });
        }

        const response = await guhatekApi.updateMeet(id, rest);

        if (response.success) {
            return NextResponse.json({ id, ...response.updated });
        } else {
            // Fallback to local DB on 404
            if (response.status === 404) {
                console.log('⚠️ API updateMeet not found (404), updating local DB');
                const db = await readDb();
                const index = db.interviews.findIndex((i: any) => i.id === id);
                if (index !== -1) {
                    db.interviews[index] = { ...db.interviews[index], ...rest };
                    await writeDb(db);
                    return NextResponse.json(db.interviews[index]);
                }
                return NextResponse.json({ error: 'Interview not found locally' }, { status: 404 });
            }

            return NextResponse.json({ error: response.message || response.error || 'Failed to update interview' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Error updating interview:', error);
        return NextResponse.json({
            error: 'Failed to update interview',
            details: error.message
        }, { status: 500 });
    }
}
