import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET() {
    try {
        const db = await readDb();
        return NextResponse.json(db.candidates);
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
        return NextResponse.json(candidate, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add candidate' }, { status: 500 });
    }
}
