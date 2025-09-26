const http = require('http');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3001;
const HOST = 'localhost';

function getHealth() {
	return new Promise((resolve, reject) => {
		const req = http.request({ host: HOST, port: PORT, path: '/api/health', method: 'GET' }, (res) => {
			let data = '';
			res.on('data', (chunk) => (data += chunk));
			res.on('end', () => {
				try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
			});
		});
		req.on('error', () => resolve(null));
		req.end();
	});
}

async function waitUntilReady(maxSeconds = 900) {
	const start = Date.now();
	while ((Date.now() - start) / 1000 < maxSeconds) {
		const h = await getHealth();
		if (h && h.indexReady) {
			console.log(`Ready: files=${h.files} chunks=${h.numChunks}`);
			return true;
		}
		console.log('Waiting for index to be ready...');
		await new Promise((r) => setTimeout(r, 5000));
	}
	return false;
}

(async () => {
	const ok = await waitUntilReady();
	if (!ok) {
		console.error('Timeout waiting for index to be ready.');
		process.exit(1);
	}
	const proc = spawn(process.execPath, ['test-api.js'], { stdio: 'inherit', cwd: __dirname });
	proc.on('exit', (code) => process.exit(code));
})();


