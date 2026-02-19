import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { email, password, role } = await request.json();

    // Mock authentication logic
    if (email && role) {
        const user = {
            id: '1',
            name: role.split('_').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
            email: email,
            role: role,
        };
        return NextResponse.json({ user });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
