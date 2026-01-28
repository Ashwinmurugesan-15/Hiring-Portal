import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function PATCH(request: Request) {
    try {
        const db = await readDb();
        const updates = await request.json();
        const { id, ...rest } = updates;

        const index = db.candidates.findIndex((c: any) => c.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
        }

        db.candidates[index] = { ...db.candidates[index], ...rest };
        await writeDb(db);
        return NextResponse.json(db.candidates[index]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
    }
}
