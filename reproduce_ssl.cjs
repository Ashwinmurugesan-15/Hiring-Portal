
const { guhatekApi } = require('./src/lib/guhatek-api'); // This won't work because guhatek-api is TS. 
// I need to use the compiled output or just write a standalone fetch script.


const https = require('https');
// const fetch = require('node-fetch'); // Using global fetch

// Standalone script to test endpoint
async function run() {
    const apiUrl = 'https://api-dev.guhatek.org/api/applications';
    console.log(`Testing connection to ${apiUrl}...`);

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);
        if (response.ok) {
            console.log('SUCCESS: Connected to API');
        } else {
            console.log('FAILURE: API returned error', response.status);
        }
    } catch (error) {
        console.error('FETCH ERROR:', error.message);
        if (error.cause) console.error('Cause:', error.cause);
    }
}

run();
