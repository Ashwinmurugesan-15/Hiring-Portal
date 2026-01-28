import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function PATCH(request: Request) {
    try {
        const db = await readDb();
        const updates = await request.json();
        const { id, ...rest } = updates;

        const index = db.demands.findIndex((d: any) => d.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'Demand not found' }, { status: 404 });
        }

        db.demands[index] = { ...db.demands[index], ...rest };
        await writeDb(db);
        return NextResponse.json(db.demands[index]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update demand' }, { status: 500 });
    }
}
