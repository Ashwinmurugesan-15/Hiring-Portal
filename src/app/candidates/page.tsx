'use client';

import Candidates from '@/legacy-pages/Candidates';
import { Suspense } from 'react';

export default function CandidatesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Candidates />
        </Suspense>
    );
}
