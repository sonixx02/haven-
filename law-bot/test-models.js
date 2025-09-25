const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModels() {
    const API_KEY = "AIzaSyBSsLA2kpRv_MOzNjRFvVE22QDUnWoLBe0";
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    const modelNames = [
        "gemini-1.5-flash",
        "gemini-1.5-pro", 
        "gemini-pro",
        "gemini-2.0-flash",
        "gemini-2.5-flash"
    ];
    
    console.log('Testing different model names...\n');
    
    for (const modelName of modelNames) {
        try {
            console.log(`Testing ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you working?");
            const response = await result.response;
            const text = response.text();
            console.log(`✅ ${modelName} works! Response: ${text.substring(0, 50)}...`);
            console.log(`🎉 Working model found: ${modelName}\n`);
            return modelName;
        } catch (err) {
            console.log(`❌ ${modelName} failed: ${err.message.split('\n')[0]}`);
        }
    }
    
    console.log('❌ No working models found');
    return null;
}

testModels();
