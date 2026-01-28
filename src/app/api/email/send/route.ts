import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/mail';

export async function POST(req: Request) {
    try {
        const { to, subject, html } = await req.json();

        if (!to || !subject || !html) {
            return NextResponse.json(
                { error: 'Missing required fields: to, subject, html' },
                { status: 400 }
            );
        }

        const result = await sendMail(to, subject, html);

        if (result.success) {
            return NextResponse.json(result, { status: 200 });
        } else {
            return NextResponse.json(
                { error: 'Failed to send email', details: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
