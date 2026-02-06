'use client';

import { Suspense } from 'react';
import Login from '@/legacy-pages/Login';

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Login />
        </Suspense>
    );
}
