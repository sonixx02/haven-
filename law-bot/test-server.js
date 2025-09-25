const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Store the PDF content
let pdfContent = '';

// Load PDF content on startup
async function loadPDFContent() {
    try {
        const pdfPath = path.join(__dirname, '..', 'law.pdf');
        console.log('Looking for PDF at:', pdfPath);
        
        if (!fs.existsSync(pdfPath)) {
            console.error('PDF file not found at:', pdfPath);
            return;
        }
        
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdf(dataBuffer);
        pdfContent = data.text;
        console.log('PDF loaded successfully. Content length:', pdfContent.length);
    } catch (error) {
        console.error('Error loading PDF:', error);
    }
}

// Initialize PDF content
loadPDFContent();

// API endpoint to query the law bot
app.post('/api/query', async (req, res) => {
    try {
        const { question } = req.body;
        
        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        if (!pdfContent) {
            return res.status(500).json({ error: 'PDF content not loaded' });
        }

        // Create a prompt that includes the PDF content and the user's question
        const prompt = `
You are a legal assistant bot. You have access to a comprehensive law document. 
Answer the user's question based ONLY on the information provided in the law document below.
Do not make up any information or provide legal advice beyond what's in the document.
Always cite the relevant sections or pages when possible.

Law Document Content:
${pdfContent}

User Question: ${question}

Please provide a structured response that includes:
1. Direct answer to the question
2. Relevant legal sections/laws mentioned
3. Key points from the document
4. Any important caveats or limitations

Response:`;

        // Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Generate response
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({
            question: question,
            answer: text,
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
        pdfLoaded: pdfContent.length > 0,
        contentLength: pdfContent.length 
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Law Bot server running on port ${PORT}`);
    console.log(`Access the bot at: http://localhost:${PORT}`);
    console.log(`API Key loaded: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
});
