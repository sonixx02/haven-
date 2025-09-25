const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAPI() {
    try {
        // Use the API key directly
        const API_KEY = "AIzaSyBSsLA2kpRv_MOzNjRFvVE22QDUnWoLBe0";
        
        console.log('Testing Gemini API...');
        console.log('API Key:', API_KEY ? 'Present' : 'Missing');
        
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
