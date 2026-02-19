import { NextResponse } from 'next/server';
import { guhatekApi } from '@/lib/guhatek-api';
import { readDb, writeDb } from '@/lib/db';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // params is a Promise in Next.js 15+
) {
    // Awaiting params is required in newer Next.js versions
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'Demand ID is required' }, { status: 400 });
    }

    try {
        const response = await guhatekApi.deleteDemand(id);

        if (response.success) {
            return NextResponse.json({ success: true, message: 'Demand deleted successfully' });
        } else {
            // Fallback to local DB on 404 or failure
            // If the API call failed (e.g. 404), we delete from local DB
            console.log(`⚠️ API deleteDemand failed (${response.status || 'Unknown'}), deleting from local DB`);

            const db = await readDb();
            const initialLength = db.demands.length;
            db.demands = db.demands.filter((d: any) => d.id !== id);

            if (db.demands.length < initialLength) {
                await writeDb(db);
                return NextResponse.json({ success: true, message: 'Demand deleted from local DB' });
            } else {
                return NextResponse.json({ error: 'Demand not found' }, { status: 404 });
            }
        }
    } catch (error: any) {
        console.error('Error deleting demand:', error);
        return NextResponse.json({
            error: 'Failed to delete demand',
            details: error.message
        }, { status: 500 });
    }
}
