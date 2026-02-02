'use server';

import { guhatekApi, ApplicationInsertData, ApplicationResponse } from '@/lib/guhatek-api';
import { revalidatePath } from 'next/cache';

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
        // Call Guhatek API
        const result = await guhatekApi.updateApplication(id, updates);

        if (result.success) {
            revalidatePath('/candidates');
        }

        return result;
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
