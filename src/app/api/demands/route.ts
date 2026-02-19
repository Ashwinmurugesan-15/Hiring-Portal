import { NextResponse } from 'next/server';
import { guhatekApi } from '@/lib/guhatek-api';
import { apiCache } from '@/lib/api-cache';
import { readDb, writeDb } from '@/lib/db';

export async function GET() {
    try {
        const cacheKey = 'demands_list';
        const cachedData = apiCache.get(cacheKey);
        if (cachedData) {
            console.log('[API] Returning cached demands');
            return NextResponse.json(cachedData);
        }

        try {
            const demands = await guhatekApi.getJobOpenings();
            apiCache.set(cacheKey, demands);
            return NextResponse.json(demands);
        } catch (error: any) {
            if (error.status !== 404) {
                console.error('Error fetching demands from API:', error.message);
            }

            // Fallback to local DB on 404 OR connection failure OR 500 (standardizing all routes)
            console.warn(`⚠️ API issue (${error.status || 'Connection Failed'}), falling back to local DB for demands`);
            const db = await readDb();
            const localDemands = db.demands || [];
            apiCache.set(cacheKey, localDemands);
            return NextResponse.json(localDemands);
        }
    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to fetch demands',
            details: error.message
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const demandData = await request.json();

        // Ensure demandData matches JobOpeningData interface
        // If the frontend sends data that matches JobOpeningData, we can pass it directly
        // Otherwise we might need to map it. 
        // Based on previous createDemand implementation: 
        // jobOpening: JobOpeningData

        const response = await guhatekApi.createDemand(demandData);

        if (response.success) {
            return NextResponse.json({ id: response.id, ...demandData }, { status: 201 });
        } else {
            // Fallback to local DB on 404
            if (response.status === 404) {
                console.log('⚠️ API createDemand not found (404), saving to local DB');
                const db = await readDb();
                const id = Date.now().toString();
                const newDemand = { id, ...demandData, createdAt: new Date().toISOString() };
                db.demands.push(newDemand);
                await writeDb(db);
                apiCache.clear('demands_list');
                return NextResponse.json(newDemand, { status: 201 });
            }

            return NextResponse.json({ error: response.message || response.error || 'Failed to create demand' }, { status: 400 });
        }

    } catch (error) {
        console.error('Error creating demand:', error);
        return NextResponse.json({ error: 'Failed to add demand' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const updates = await request.json();
        const { id, ...rest } = updates;

        if (!id) {
            return NextResponse.json({ error: 'Demand ID is required' }, { status: 400 });
        }

        const response = await guhatekApi.updateDemand(id, rest);

        if (response.success) {
            return NextResponse.json({ id, ...response.updated });
        } else {
            // Fallback to local DB on 404
            if (response.status === 404) {
                console.log('⚠️ API updateDemand not found (404), updating local DB');
                const db = await readDb();
                const index = db.demands.findIndex((d: any) => d.id === id);
                if (index !== -1) {
                    db.demands[index] = { ...db.demands[index], ...rest };
                    await writeDb(db);
                    return NextResponse.json(db.demands[index]);
                }
                return NextResponse.json({ error: 'Demand not found locally' }, { status: 404 });
            }

            return NextResponse.json({ error: response.message || response.error || 'Failed to update demand' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Error updating demand:', error);
        return NextResponse.json({
            error: 'Failed to update demand',
            details: error.message
        }, { status: 500 });
    }
}
