import { guhatekApi as apiObject } from './guhatek-api';

export interface ExternalApplication {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    resume_url: string;
    applied_at: string;
}

// Helper to get config lazily
const getConfig = () => ({
    apiUrl: process.env.GUHATEK_API_URL,
    apiKey: process.env.GUHATEK_API_KEY
});

export const guhatekApi = {
    /**
     * Fetches a short-lived authentication token using the API key.
     */
    async getAuthToken(): Promise<string> {
        const { apiUrl, apiKey } = getConfig();
        if (!apiUrl || !apiKey) {
            throw new Error('GUHATEK_API_URL or GUHATEK_API_KEY is not configured');
        }

        try {
            console.log('Fetching auth token from:', `${apiUrl}/api/token`);
            console.log('Using API Key:', apiKey ? 'Present' : 'Missing');

            const response = await fetch(`${apiUrl}/api/token`, {
                method: 'GET',
                headers: {
                    'x-api-key': apiKey || '',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                // Check if it's a 404 (common if URL is wrong)
                if (response.status === 404) {
                    throw new Error('Network Error: Endpoint not found (404). Check GUHATEK_API_URL.');
                }
                console.error('Token verification failed:', response.status, response.statusText, errorText);
                throw new Error(`Failed to fetch token: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Auth Token received successfully');
            return data.token;
        } catch (error) {
            console.error('❌ Auth Token Fetch Error:', error);
            // Explicitly throw to respect "Real API" requirement
            throw new Error('API_CONNECTION_FAILED: Unable to reach Guhatek API. Check VPN/Proxy settings.');
        }
    },

    /**
     * Fetches the list of applications. 
     */
    async getApplications(): Promise<ExternalApplication[]> {
        const { apiUrl } = getConfig();
        if (!apiUrl) {
            console.warn('GUHATEK_API_URL missing.');
            return [];
        }

        try {
            const token = await this.getAuthToken();

            const response = await fetch(`${apiUrl}/api/applications`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch applications: ${response.statusText}`);
            }

            const data = await response.json();
            // Checking various possible response structures for flexibility
            if (Array.isArray(data)) {
                return data;
            }
            if (data.data && Array.isArray(data.data)) {
                return data.data;
            }
            if (data.applications && Array.isArray(data.applications)) {
                return data.applications;
            }

            console.warn('Unexpected API response structure:', data);
            return [];
        } catch (error) {
            console.error('API Error: Fetch failed.', error);
            throw error;
        }
    },

    /**
     * Inserts a new application with resume file.
     */
    async insertApplication(file: File, applicationData: ApplicationInsertData): Promise<ApplicationResponse> {
        const { apiUrl } = getConfig();
        if (!apiUrl) {
            return { success: false, error: 'API URL not configured' };
        }

        try {
            const token = await this.getAuthToken();

            const formData = new FormData();
            formData.append('file', file);
            formData.append('applicationData', JSON.stringify(applicationData));

            const response = await fetch(`${apiUrl}/api/applications`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to insert application: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Insert Application Successful. Response:', JSON.stringify(data, null, 2));
            return data;
        } catch (error: any) {
            console.error('❌ Insert Application Error:', error);
            return { success: false, error: error.message || 'Unknown error occurred' };
        }
    },

    /**
     * Updates an existing application.
     */
    async updateApplication(id: string, updates: ApplicationUpdateData): Promise<ApplicationResponse> {
        const { apiUrl } = getConfig();
        if (!apiUrl) {
            return { success: false, error: 'API URL not configured' };
        }

        try {
            const token = await this.getAuthToken();

            const response = await fetch(`${apiUrl}/api/applications/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update application: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Update Application Successful. Response:', JSON.stringify(data, null, 2));
            return data;
        } catch (error: any) {
            console.error('❌ Update Application Error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Deletes an application.
     */
    async deleteApplication(id: string): Promise<ApplicationResponse> {
        const { apiUrl } = getConfig();
        if (!apiUrl) {
            return { success: false, error: 'API URL not configured' };
        }

        try {
            const token = await this.getAuthToken();

            const response = await fetch(`${apiUrl}/api/applications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete application: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Delete Application Successful. Response:', JSON.stringify(data, null, 2));
            return data;
        } catch (error: any) {
            console.error('❌ Delete Application Error:', error);
            return { success: false, error: error.message };
        }
    }
};

const MOCK_APPLICATIONS: ExternalApplication[] = [
    { id: '1', name: 'Alice Mock', email: 'alice@example.com', phone: '1234567890', role: 'Frontend Dev', status: 'Applied', resume_url: '#', applied_at: new Date().toISOString() },
    { id: '2', name: 'Bob Mock', email: 'bob@example.com', phone: '0987654321', role: 'Backend Dev', status: 'Interviewing', resume_url: '#', applied_at: new Date().toISOString() },
];

export interface ApplicationInsertData {
    fullName: string;
    email: string;
    contactNumber: string;
    linkedinProfile?: string;
    interestedPosition: string;
    currentRole?: string;
    currentOrganization?: string;
    totalExperience?: number;
    currentLocation?: string;
    locationPreference?: string;
    currentCTC?: number;
    expectedCTC?: number;
    noticePeriod?: string;
    currentlyInNotice?: boolean;
    immediateJoiner?: boolean;
    otherOffersInHand?: boolean;
    certifications?: string;
    referredBy?: string;
    additionalInfo?: string;
    submittedAt?: string;

    initialScreening?: string;
    round1Dt?: string;
    round1Feedback?: string;
    round2Dt?: string;
    round2Feedback?: string;
    offeredPosition?: string;
    joiningDate?: string;
    rejectMailSent?: boolean;
    canAdminEdit?: boolean;
    screenedBy?: string;
    actions?: string;
}

export interface ApplicationUpdateData {
    initialScreening?: string;
    round1Dt?: string;
    round1Feedback?: string;
    round2Dt?: string;
    round2Feedback?: string;
    offeredPosition?: string;
    joiningDate?: string;
    rejectMailSent?: boolean;
    canAdminEdit?: boolean;
    screenedBy?: string;
    actions?: string;
    [key: string]: any; // Allow other fields for flexibility
}

export interface ApplicationResponse {
    success: boolean;
    id?: string;
    updated?: any;
    error?: string;
}
