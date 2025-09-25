const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');

async function testLawBot() {
    try {
        console.log('🧪 Testing Law Bot Components...\n');
        
        // 1. Test API Key
        console.log('1. Testing API Key...');
        const API_KEY = "AIzaSyBSsLA2kpRv_MOzNjRFvVE22QDUnWoLBe0";
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const testResult = await model.generateContent("Hello");
        const testResponse = await testResult.response;
        const testText = testResponse.text();
        console.log('✅ API Key working:', testText.substring(0, 50) + '...\n');
        
        // 2. Test PDF Loading
        console.log('2. Testing PDF Loading...');
        const pdfPath = path.join(__dirname, '..', 'law.pdf');
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdf(dataBuffer);
        const pdfContent = data.text;
        console.log('✅ PDF loaded successfully, length:', pdfContent.length, 'characters\n');
        
        // 3. Test Law Query
        console.log('3. Testing Law Query...');
        const prompt = `
You are a legal assistant bot. You have access to a comprehensive law document. 
Answer the user's question based ONLY on the information provided in the law document below.
Do not make up any information or provide legal advice beyond what's in the document.

Law Document Content:
${pdfContent.substring(0, 10000)}...

User Question: What are my rights if my husband beats me?

Please provide a structured response that includes:
1. Direct answer to the question
2. Relevant legal sections/laws mentioned
3. Key points from the document

Response:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ Law Query successful!');
        console.log('Answer preview:', text.substring(0, 200) + '...\n');
        
        console.log('🎉 All tests passed! Your Law Bot is ready to use!');
        console.log('🌐 Access it at: http://localhost:3001');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testLawBot();
