const DOMAINS = ['https://api-dev.guhatek.org', 'https://api-careerpage.guhatek.com'];
const API_KEY = 'guhatek-job-applicant';

async function probeApi() {
    console.log('Probing Guhatek API across domains...');

    for (const domain of DOMAINS) {
        console.log(`\nTesting Domain: ${domain}`);
        const tokenPaths = ['/api/token', '/token', '/auth/token', '/api/v1/token'];

        let token = null;
        for (const path of tokenPaths) {
            console.log(`  -> Trying token path: ${path}`);
            try {
                const tokenRes = await fetch(`${domain}${path}`, {
                    headers: { 'x-api-key': API_KEY }
                });
                if (tokenRes.ok) {
                    const data = await tokenRes.json();
                    token = data.token;
                    console.log(`  ✅ Token obtained via ${path}: ${token.substring(0, 10)}...`);
                    break;
                } else {
                    console.error(`  ❌ ${path} failed: ${tokenRes.status} ${tokenRes.statusText}`);
                }
            } catch (err) {
                console.error(`  ❌ ${path} error: ${err.message}`);
            }
        }

        if (token) {
            const dataEndpoints = [
                '/api/applications',
                '/api/applications/jobOpenings',
                '/api/applications/scheduleMeet'
            ];
            for (const endpoint of dataEndpoints) {
                console.log(`    -> Probing ${endpoint}...`);
                try {
                    const res = await fetch(`${domain}${endpoint}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (res.ok) {
                        console.log(`    ✅ ${endpoint} - OK (${res.status})`);
                    } else {
                        console.error(`    ❌ ${endpoint} - Failed (${res.status})`);
                    }
                } catch (err) {
                    console.error(`    ❌ ${endpoint} error: ${err.message}`);
                }
            }
        }
    }
}

probeApi();
