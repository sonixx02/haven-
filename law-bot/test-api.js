const http = require('http');

const PORT = process.env.PORT || 3001;
const HOST = 'localhost';

function httpGet(pathname) {
	return new Promise((resolve, reject) => {
		const req = http.request({ host: HOST, port: PORT, path: pathname, method: 'GET' }, (res) => {
			let data = '';
			res.on('data', (chunk) => (data += chunk));
			res.on('end', () => {
				try { resolve({ status: res.statusCode, json: JSON.parse(data) }); }
				catch (e) { resolve({ status: res.statusCode, text: data }); }
			});
		});
		req.on('error', reject);
		req.end();
	});
}

function httpPost(pathname, body) {
	const payload = JSON.stringify(body);
	const options = {
		host: HOST,
		port: PORT,
		path: pathname,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(payload)
		}
	};
	return new Promise((resolve, reject) => {
		const req = http.request(options, (res) => {
			let data = '';
			res.on('data', (chunk) => (data += chunk));
			res.on('end', () => {
				try { resolve({ status: res.statusCode, json: JSON.parse(data) }); }
				catch (e) { resolve({ status: res.statusCode, text: data }); }
			});
		});
		req.on('error', reject);
		req.write(payload);
		req.end();
	});
}

async function run() {
	console.log('Testing health...');
	const health = await httpGet('/api/health');
	if (health.status !== 200) {
		console.error('Health check failed with status', health.status, health.text || health.json);
		process.exit(1);
	}
	const { knowledgeLoaded, numChunks, files, indexReady } = health.json;
	console.log('health:', { knowledgeLoaded, numChunks, files, indexReady });
	if (!indexReady) {
		console.error('Index not ready. Try again after indexing completes.');
		process.exit(1);
	}
	if (!knowledgeLoaded || !numChunks || !files) {
		console.warn('Knowledge may be empty: please ensure PDFs are in the knowledge folder.');
	}

	const tests = [
		'What are my rights if my husband beats me?',
		'What are laws for dowry harassment?',
		'How does child custody work for mothers?',
		'What are my rights if I am arrested?'
	];

	for (const q of tests) {
		console.log('\nQ:', q);
		const res = await httpPost('/api/query', { question: q });
		if (res.status !== 200) {
			console.error('Query failed:', res.status, res.text || res.json);
			continue;
		}
		const { structured, answer } = res.json;
		const ok = !!answer && typeof answer === 'string';
		const hasStructured = structured && typeof structured === 'object';
		console.log('answer.ok:', ok, '| structured:', !!hasStructured);
		if (hasStructured) {
			console.log('summary:', (structured.summary || '').slice(0, 140));
			console.log('rights.count:', Array.isArray(structured.rights) ? structured.rights.length : 0,
				'actions.count:', Array.isArray(structured.actions) ? structured.actions.length : 0,
				'refs.count:', Array.isArray(structured.references) ? structured.references.length : 0);
		}
	}

	console.log('\nAll tests completed.');
}

run().catch((e) => {
	console.error('Test runner error:', e);
	process.exit(1);
});

const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testAPI() {
    try {
        console.log('Testing Gemini API...');
        console.log('API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
        
        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ No API key found in .env file');
            return;
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log('Sending test query...');
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        const text = response.text();

        console.log('✅ API is working!');
        console.log('Response:', text);
        
    } catch (error) {
        console.error('❌ API Error:', error.message);
        
        if (error.message.includes('API_KEY_INVALID')) {
            console.log('\n🔧 Solutions:');
            console.log('1. Check if your API key is correct');
            console.log('2. Make sure you have enabled the Gemini API in Google AI Studio');
            console.log('3. Try generating a new API key');
            console.log('4. Check if you have quota remaining');
        }
    }
}

testAPI();
