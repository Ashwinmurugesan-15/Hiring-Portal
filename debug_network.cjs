const { fetch: undiciFetch, Agent } = require('undici');
const { execSync } = require('child_process');
const dns = require('dns');

const URL = 'https://api-dev.guhatek.org/api/token';
const API_KEY = 'guhatek-job-applicant';

console.log('--- NETWORK DEBUGGER ---');

// 1. Check DNS
console.log('\n1. DNS Resolution for api-dev.guhatek.org:');
dns.lookup('api-dev.guhatek.org', (err, address, family) => {
    console.log('IP Address:', address);
    console.log('Family: IPv' + family);
    if (err) console.error('DNS Error:', err);
});

// 2. Check Proxy Env Vars
console.log('\n2. Proxy Environment Variables:');
console.log('http_proxy:', process.env.http_proxy || 'Not Set');
console.log('https_proxy:', process.env.https_proxy || 'Not Set');

// 3. Run CURL (System)
console.log('\n3. System CURL Test:');
try {
    const curlCmd = `curl -I -X GET "${URL}" -H "x-api-key: ${API_KEY}" -k -v`;
    const output = execSync(curlCmd, { encoding: 'utf8', stdio: 'pipe' });
    console.log('CURL Output (Headers):');
    console.log(output);
} catch (e) {
    console.log('CURL Failed:', e.message);
    if (e.stderr) console.log('CURL Stderr:', e.stderr.toString());
}

// 4. Run Undici Fetch
async function runUndici() {
    console.log('\n4. Undici Fetch Test:');
    try {
        const response = await undiciFetch(URL, {
            method: 'GET',
            headers: {
                'x-api-key': API_KEY,
                'User-Agent': 'curl/7.81.0', // Masquerade
                'Accept': '*/*'
            },
            dispatcher: new Agent({
                connect: {
                    rejectUnauthorized: false
                }
            })
        });

        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Response Headers:', response.headers);
        const text = await response.text();
        console.log('Body Preview:', text.substring(0, 200));
    } catch (error) {
        console.error('Undici Error:', error);
    }
}

// Run async tests
setTimeout(async () => {
    await runUndici();
}, 2000); // Wait for DNS
