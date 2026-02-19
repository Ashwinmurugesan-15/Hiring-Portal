
import fs from 'fs';
import path from 'path';

// Load .env manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        envVars[match[1].trim()] = match[2].trim();
    }
});

const API_URL = envVars['GUHATEK_API_URL'];
const API_KEY = envVars['GUHATEK_API_KEY'];

if (!API_URL || !API_KEY) {
    console.error('Missing API_URL or API_KEY in .env');
    process.exit(1);
}

async function getAuthToken() {
    console.log(`Getting token from ${API_URL}/api/token...`);
    const response = await fetch(`${API_URL}/api/token`, {
        headers: { 'x-api-key': API_KEY }
    });

    if (!response.ok) {
        console.error('Failed to get token:', response.status, await response.text());
        return null;
    }

    const data = await response.json();
    return data.token;
}

async function run() {
    console.log(`Using API_URL: ${API_URL}`);
    const token = await getAuthToken();
    if (!token) return;

    console.log('Token received.');

    // 1. Get Applications
    console.log('\n--- Testing GET /api/applications ---');
    const appsRes = await fetch(`${API_URL}/api/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!appsRes.ok) {
        console.error('GET /api/applications failed:', appsRes.status, await appsRes.text());
        return;
    }

    const appsData = await appsRes.json();
    const apps = Array.isArray(appsData) ? appsData : (appsData.data || appsData.applications || []);
    console.log(`Fetched ${apps.length} applications.`);

    if (apps.length === 0) {
        console.log('No applications to test PATCH with.');
        return;
    }

    const testAppId = apps[0].id; // Use the first app for testing
    console.log(`\n--- Testing PATCH /api/applications/${testAppId} ---`);

    const updateData = {
        can_admin_edit: true // Try a simple update
    };

    const patchRes = await fetch(`${API_URL}/api/applications/${testAppId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });

    console.log(`PATCH Response Status: ${patchRes.status}`);
    const patchText = await patchRes.text();
    console.log(`PATCH Response Body: ${patchText}`);

    // If PATCH fails with 404, try PUT
    if (patchRes.status === 404 || patchRes.status === 405) {
        console.log(`\n--- Testing PUT /api/applications/${testAppId} (Fallback Check) ---`);
        const putRes = await fetch(`${API_URL}/api/applications/${testAppId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        console.log(`PUT Response Status: ${putRes.status}`);
        console.log(`PUT Response Body: ${await putRes.text()}`);
    }
}

run().catch(console.error);
