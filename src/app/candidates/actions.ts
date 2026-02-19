'use server';

import { guhatekApi, ApplicationInsertData, ApplicationResponse } from '@/lib/guhatek-api';
import { revalidatePath } from 'next/cache';
import { readDb, writeDb } from '@/lib/db';

export async function createCandidateAction(formData: FormData): Promise<ApplicationResponse> {
    try {
        const file = formData.get('file') as File;
        const applicationJson = formData.get('applicationData') as string;

        if (!file || !applicationJson) {
            return { success: false, error: 'File or application data missing' };
        }

        const applicationData: ApplicationInsertData = JSON.parse(applicationJson);

        // Call Guhatek API
        const result = await guhatekApi.insertApplication(file, applicationData);

        if (result.success) {
            // Revalidate candidates page to show new data if we were fetching from there
            // Currently the component might use local state or a different fetch, 
            // but revalidating is good practice.
            revalidatePath('/candidates');
        }

        return result;
    } catch (error: any) {
        console.error('Create Candidate Action Error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateCandidateAction(id: string, updates: any): Promise<ApplicationResponse> {
    try {
        let apiSuccess = false;
        try {
            // Call Guhatek API
            const result = await guhatekApi.updateApplication(id, updates);
            apiSuccess = result.success;
        } catch (error: any) {
            // If API fails (especially 404), we log it but continue to update local DB
            console.warn(`API update failed for ${id}: ${error.message}. Falling back to local DB.`);
        }

        // Always try to update local DB to ensure persistence of local-only fields or fallback
        try {
            const db = await readDb();
            const candidates = db.candidates || [];
            const existingIndex = candidates.findIndex((c: any) => c.id === id);

            if (existingIndex >= 0) {
                // Update existing local candidate
                candidates[existingIndex] = { ...candidates[existingIndex], ...updates };
            } else {
                // Determine if we should create a new local entry for this API candidate
                // If it wasn't in local DB but we are updating it, it means it was fetched from API.
                // We add a partial entry with the ID and updates. 
                // The route.ts will merge this with API data.
                candidates.push({
                    id,
                    ...updates,
                    // If we don't have name/email here, route.ts should still have them from API
                    updatedAt: new Date().toISOString()
                });
            }
            await writeDb(db);
        } catch (dbError) {
            console.error('Failed to update local DB:', dbError);
            if (!apiSuccess) {
                // If both API and DB failed, returns error
                throw new Error('Failed to update candidate in both API and local storage.');
            }
        }

        revalidatePath('/candidates');
        return { success: true, updated: updates };
    } catch (error: any) {
        console.error('Update Candidate Action Error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteCandidateAction(id: string): Promise<ApplicationResponse> {
    try {
        // Call Guhatek API
        const result = await guhatekApi.deleteApplication(id);

        if (result.success) {
            revalidatePath('/candidates');
        }

        return result;
    } catch (error: any) {
        console.error('Delete Candidate Action Error:', error);
        return { success: false, error: error.message };
    }
}
