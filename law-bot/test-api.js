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
