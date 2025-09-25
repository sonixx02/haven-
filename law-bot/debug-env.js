require('dotenv').config({ path: require('path').join(__dirname, '.env') });

console.log('Environment variables:');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
console.log('PORT:', process.env.PORT);

if (process.env.GEMINI_API_KEY) {
    console.log('API Key length:', process.env.GEMINI_API_KEY.length);
    console.log('API Key starts with:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
} else {
    console.log('❌ API key not found in environment variables');
}
