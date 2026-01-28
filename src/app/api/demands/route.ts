import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET() {
    try {
        const db = await readDb();
        return NextResponse.json(db.demands);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch demands' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const db = await readDb();
        const demand = await request.json();
        db.demands.push(demand);
        await writeDb(db);
        return NextResponse.json(demand, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add demand' }, { status: 500 });
    }
}
