import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET() {
    try {
        const db = await readDb();
        return NextResponse.json(db.interviews);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch interviews' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const db = await readDb();
        const interview = await request.json();
        db.interviews.push(interview);
        await writeDb(db);
        return NextResponse.json(interview, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add interview' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const db = await readDb();
        const updates = await request.json();
        const { id, ...rest } = updates;

        const index = db.interviews.findIndex((i: any) => i.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
        }

        db.interviews[index] = { ...db.interviews[index], ...rest };
        await writeDb(db);
        return NextResponse.json(db.interviews[index]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update interview' }, { status: 500 });
    }
}
