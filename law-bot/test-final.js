const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testQuery() {
    try {
        console.log('🧪 Testing Law Bot Query...');
        
        const response = await fetch('http://localhost:3001/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: "What are my rights if my husband beats me?"
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Query successful!');
            console.log('Question:', data.question);
            console.log('Answer preview:', data.answer.substring(0, 300) + '...');
        } else {
            console.log('❌ Query failed:', data.error);
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

testQuery();
