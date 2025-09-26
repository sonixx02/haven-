const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Gemini AI
const API_KEY = "AIzaSyBSsLA2kpRv_MOzNjRFvVE22QDUnWoLBe0";
const genAI = new GoogleGenerativeAI(API_KEY);

// In-memory knowledge base (multi-PDF, chunked)
let knowledgeChunks = [];
let chunkEmbeddings = [];
let indexReady = false;
let knowledgeFiles = 0;
let embeddingReady = false;

// Chunking and embeddings config
const KNOWLEDGE_DIR = path.join(__dirname, '..', 'knowledge');
const FALLBACK_DIR = path.join(__dirname, '..');
const CHUNK_SIZE = 1400;
const CHUNK_OVERLAP = 200;
const MAX_PROMPT_CHARS = 150000;
const MAX_RETURN_CHARS = 120000;
const TOP_K = 12;
let INDEX_DIR = fs.existsSync(KNOWLEDGE_DIR) ? KNOWLEDGE_DIR : FALLBACK_DIR;
const INDEX_PATH = path.join(INDEX_DIR, 'knowledge_index.json');

function splitIntoChunks(text) {
	const chunks = [];
	if (!text) return chunks;
	let start = 0;
	while (start < text.length) {
		const end = Math.min(start + CHUNK_SIZE, text.length);
		const slice = text.slice(start, end);
		chunks.push(slice);
		if (end === text.length) break;
		start = end - CHUNK_OVERLAP;
		if (start < 0) start = 0;
	}
	return chunks;
}

function cosineSimilarity(a, b) {
	let dot = 0;
	let na = 0;
	let nb = 0;
	for (let i = 0; i < a.length && i < b.length; i++) {
		dot += a[i] * b[i];
		na += a[i] * a[i];
		nb += b[i] * b[i];
	}
	const denom = Math.sqrt(na) * Math.sqrt(nb);
	return denom === 0 ? 0 : dot / denom;
}

function tokenize(text) {
    return (text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
}

function jaccardSimilarity(tokensA, tokensB) {
    if (!tokensA.length || !tokensB.length) return 0;
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);
    let inter = 0;
    for (const t of setA) if (setB.has(t)) inter++;
    const union = setA.size + setB.size - inter;
    return union === 0 ? 0 : inter / union;
}

async function loadAllPDFsAndIndex() {
    try {
        let sourceDir = KNOWLEDGE_DIR;
        if (!fs.existsSync(sourceDir)) {
            sourceDir = FALLBACK_DIR;
        }
        INDEX_DIR = sourceDir;
        const files = fs.readdirSync(sourceDir)
            .filter(f => f.toLowerCase().endsWith('.pdf'))
            .map(f => path.join(sourceDir, f));
        if (files.length === 0) {
            knowledgeChunks = [];
            chunkEmbeddings = [];
            knowledgeFiles = 0;
            indexReady = true;
            return;
        }

        // Attempt to load cached index if fresh
        function getFilesMeta(paths) {
            return paths.map(p => ({
                name: path.basename(p),
                mtimeMs: fs.statSync(p).mtimeMs,
                size: fs.statSync(p).size
            })).sort((a,b)=> a.name.localeCompare(b.name));
        }

        function isIndexFresh(cache) {
            try {
                if (!cache || !Array.isArray(cache.filesMeta)) return false;
                const current = getFilesMeta(files);
                if (current.length !== cache.filesMeta.length) return false;
                for (let i=0;i<current.length;i++) {
                    const a = current[i], b = cache.filesMeta[i];
                    if (a.name !== b.name || a.mtimeMs !== b.mtimeMs || a.size !== b.size) return false;
                }
                return true;
            } catch { return false; }
        }

        function loadIndexFromDisk() {
            try {
                if (!fs.existsSync(INDEX_PATH)) return null;
                const raw = fs.readFileSync(INDEX_PATH, 'utf8');
                const data = JSON.parse(raw);
                return data;
            } catch { return null; }
        }

        function saveIndexToDisk(payload) {
            try {
                fs.writeFileSync(INDEX_PATH, JSON.stringify(payload), 'utf8');
            } catch {}
        }

        const cached = loadIndexFromDisk();
        if (cached && isIndexFresh(cached)) {
            knowledgeChunks = cached.knowledgeChunks || [];
            chunkEmbeddings = cached.chunkEmbeddings || [];
            knowledgeFiles = files.length;
            indexReady = true;
            embeddingReady = Array.isArray(chunkEmbeddings) && chunkEmbeddings.length === knowledgeChunks.length && chunkEmbeddings.some(v => Array.isArray(v) && v.length);
            return;
        }

        const loadedChunks = [];
		for (const filePath of files) {
			try {
				const dataBuffer = fs.readFileSync(filePath);
				const data = await pdf(dataBuffer);
				const text = data.text || '';
                const chunks = splitIntoChunks(text);
				chunks.forEach((chunkText, idx) => {
					loadedChunks.push({
						id: `${path.basename(filePath)}::${idx}`,
						source: path.basename(filePath),
                        text: chunkText,
                        tokens: tokenize(chunkText)
					});
				});
			} catch (err) {
                // keep quiet on per-file errors to avoid noisy console
			}
		}

		knowledgeChunks = loadedChunks;
        knowledgeFiles = files.length;
        // Mark index (chunking) as ready so fallback search can work
        indexReady = true;

		// Compute embeddings
        const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
		chunkEmbeddings = [];
		for (const ch of knowledgeChunks) {
			try {
				const emb = await embeddingModel.embedContent({
					content: { parts: [{ text: ch.text }] }
				});
				const values = emb?.embedding?.values || emb?.data?.[0]?.embedding?.values || [];
				chunkEmbeddings.push(values);
			} catch (e) {
                // suppress noisy embedding errors; push empty vector
				chunkEmbeddings.push([]);
			}
		}
        embeddingReady = true;

        // Save fresh index to disk
        saveIndexToDisk({
            filesMeta: getFilesMeta(files),
            knowledgeChunks,
            chunkEmbeddings
        });
	} catch (error) {
        // keep startup clean
        // Keep chunk index available even if embeddings fail
        embeddingReady = false;
	}
}

// Initialize knowledge base
loadAllPDFsAndIndex();

// API endpoint to query the law bot
app.post('/api/query', async (req, res) => {
    try {
        const { question } = req.body;
        
        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        if (!knowledgeChunks.length || !indexReady) {
            return res.status(503).json({ error: 'Knowledge base indexing in progress. Please try again in a moment.' });
        }

        // Retrieve top-k relevant chunks using embeddings if ready, else token overlap fallback
        let scored = [];
        if (embeddingReady) {
            try {
                const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
                const qEmbRes = await embeddingModel.embedContent({ content: { parts: [{ text: question }] } });
                const qVec = qEmbRes?.embedding?.values || qEmbRes?.data?.[0]?.embedding?.values || [];
                scored = knowledgeChunks.map((ch, i) => ({
                    idx: i,
                    score: chunkEmbeddings[i] && chunkEmbeddings[i].length ? cosineSimilarity(qVec, chunkEmbeddings[i]) : 0,
                    source: ch.source,
                    text: ch.text
                })).sort((a, b) => b.score - a.score);
            } catch (_) {
                // fall through to token-based scoring
            }
        }
        if (!scored.length) {
            const qTokens = tokenize(question);
            scored = knowledgeChunks.map((ch, i) => ({
                idx: i,
                score: jaccardSimilarity(qTokens, ch.tokens || []),
                source: ch.source,
                text: ch.text
            })).sort((a, b) => b.score - a.score);
        }

        const selected = [];
        let total = 0;
        for (const s of scored) {
            if (selected.length >= TOP_K) break;
            if (total + s.text.length > MAX_RETURN_CHARS) break;
            selected.push(s);
            total += s.text.length;
        }

        const knowledgeBlock = selected.map((s, i) => `Source: ${s.source}\nChunk ${i + 1}:\n${s.text}`).join('\n\n---\n\n');

        // Create a prompt that includes the retrieved chunks and enforces strict JSON output
        const prompt = `
You are HAVEN, a safety-first legal information assistant that empowers women with knowledge of their rights.
Instructions:
- Aggregate across ALL provided excerpts: extract the most relevant facts and synthesize them.
- Base your answer ONLY on the provided document text. If information is missing, say "Not found in the provided document."
- Be accurate, neutral, and ethical. Do NOT provide professional legal advice. Provide general information only.
- If the user indicates immediate danger, include safety guidance to contact local authorities and hotlines.
- Tailor answers to the user's jurisdiction if inferable; otherwise state the assumed jurisdiction.
- Keep language clear and simple. Avoid special decorative characters. Use plain text and simple dashes for bullets.
- Output STRICTLY a single JSON object with this exact structure and keys. Do NOT include backticks, code fences, or extra commentary.
{
  "jurisdiction": string,
  "summary": string,
  "assurance": string,
  "rights": [string],
  "actions": [string],
  "references": [ { "title": string, "section": string, "citation": string, "page": string } ],
  "caveats": [string],
  "safety": [string],
  "disclaimer": string,
  "confidence": number
}

Document (knowledge base excerpts, multiple sources):
${knowledgeBlock.slice(0, MAX_PROMPT_CHARS)}

User question:
${question}

Return only the JSON.`;

        // Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Generate response
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Try to parse strict JSON; if it fails, attempt to extract JSON; else clean text
        function cleanText(input) {
            if (!input) return '';
            let out = input.replace(/[\u200B-\u200D\uFEFF]/g, ''); // zero-width chars
            out = out.replace(/[\t\r]+/g, ' ');
            out = out.replace(/\u00A0/g, ' ');
            out = out.replace(/[•\*]+\s?/g, '- '); // bullets
            out = out.replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
            return out.trim();
        }

        let structured = null;
        let formattedAnswer = '';
        try {
            structured = JSON.parse(text);
        } catch (e) {
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                const possibleJson = text.slice(firstBrace, lastBrace + 1);
                try { structured = JSON.parse(possibleJson); } catch (_) { /* ignore */ }
            }
        }

        if (structured && typeof structured === 'object') {
            // Build a clean, plain-text answer for display from the structured fields
            const parts = [];
            if (structured.summary) parts.push(structured.summary);
            if (structured.assurance) parts.push(structured.assurance);
            if (Array.isArray(structured.rights) && structured.rights.length) {
                parts.push('Rights:\n' + structured.rights.map(r => `- ${r}`).join('\n'));
            }
            if (Array.isArray(structured.actions) && structured.actions.length) {
                parts.push('Recommended Actions:\n' + structured.actions.map(a => `- ${a}`).join('\n'));
            }
            if (Array.isArray(structured.references) && structured.references.length) {
                const refs = structured.references.map(ref => {
                    const title = ref.title || 'Reference';
                    const section = ref.section ? `, Section: ${ref.section}` : '';
                    const citation = ref.citation ? `, Citation: ${ref.citation}` : '';
                    const page = ref.page ? `, Page: ${ref.page}` : '';
                    return `- ${title}${section}${citation}${page}`;
                }).join('\n');
                parts.push('References:\n' + refs);
            }
            if (Array.isArray(structured.caveats) && structured.caveats.length) {
                parts.push('Caveats:\n' + structured.caveats.map(c => `- ${c}`).join('\n'));
            }
            if (Array.isArray(structured.safety) && structured.safety.length) {
                parts.push('Safety:\n' + structured.safety.map(s => `- ${s}`).join('\n'));
            }
            if (structured.disclaimer) parts.push(`Disclaimer: ${structured.disclaimer}`);
            if (structured.jurisdiction) parts.push(`Jurisdiction: ${structured.jurisdiction}`);
            if (typeof structured.confidence === 'number') parts.push(`Confidence: ${structured.confidence}`);
            formattedAnswer = cleanText(parts.join('\n\n'));
        } else {
            formattedAnswer = cleanText(text);
        }

        res.json({
            question: question,
            answer: formattedAnswer,
            structured: structured || null,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error processing query:', error);
        res.status(500).json({ 
            error: 'Failed to process query',
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        knowledgeLoaded: knowledgeChunks.length > 0,
        numChunks: knowledgeChunks.length,
        files: knowledgeFiles,
        indexReady: indexReady,
        embeddingReady: embeddingReady
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rebuild knowledge index on demand
app.post('/api/reindex', async (req, res) => {
    try {
        indexReady = false;
        embeddingReady = false;
        await loadAllPDFsAndIndex();
        return res.json({
            status: 'OK',
            message: 'Reindex completed',
            files: knowledgeFiles,
            numChunks: knowledgeChunks.length,
            indexReady,
            embeddingReady
        });
    } catch (e) {
        return res.status(500).json({ error: 'Reindex failed', details: e?.message || String(e) });
    }
});

function openBrowser(url) {
    const platform = process.platform;
    if (platform === 'win32') {
        exec(`start "" ${url}`);
    } else if (platform === 'darwin') {
        exec(`open ${url}`);
    } else {
        exec(`xdg-open ${url}`);
    }
}

app.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    openBrowser(url);
});
