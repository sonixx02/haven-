const { GoogleGenerativeAI } = require('@google/generative-ai');

async function checkModels() {
    try {
        const API_KEY = "AIzaSyBSsLA2kpRv_MOzNjRFvVE22QDUnWoLBe0";
        
        console.log('Checking available models...');
        
        const genAI = new GoogleGenerativeAI(API_KEY);
        
        // Try to list models
        const models = await genAI.listModels();
        console.log('Available models:', models);
        
    } catch (error) {
        console.error('Error:', error.message);
        
        // Try different model names
        const modelNames = [
            "gemini-1.5-flash",
            "gemini-1.5-pro", 
            "gemini-pro",
            "gemini-2.0-flash",
            "gemini-2.5-flash"
        ];
        
        console.log('\nTrying different model names...');
        
        for (const modelName of modelNames) {
            try {
                console.log(`Testing ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                const response = await result.response;
                const text = response.text();
                console.log(`✅ ${modelName} works! Response: ${text.substring(0, 50)}...`);
                break;
            } catch (err) {
                console.log(`❌ ${modelName} failed: ${err.message.split('\n')[0]}`);
            }
        }
    }
}

checkModels();
