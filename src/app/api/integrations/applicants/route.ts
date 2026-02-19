import { NextResponse } from 'next/server';
import { guhatekApi } from '@/lib/guhatek-api';

export const dynamic = 'force-dynamic'; // Ensure this route is not cached statically

export async function GET() {
    try {
        const applications = await guhatekApi.getApplications();
        return NextResponse.json(applications);
    } catch (error: any) {
        console.error('API Integration Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch external applications', details: error.message },
            { status: 500 }
        );
    }
}
