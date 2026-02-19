import { NextResponse } from 'next/server';
import { guhatekApi } from '@/lib/guhatek-api';
import { readDb, writeDb } from '@/lib/db';

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
