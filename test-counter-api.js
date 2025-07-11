// Counter API Unit Tests
// Run with: node test-counter-api.js

const https = require('https');
const http = require('http');

// Test configuration
const TEST_SERVICES = [
    {
        name: 'CountAPI (Basic)',
        url: 'https://api.countapi.xyz/get/test-namespace/visitors',
        method: 'GET'
    },
    {
        name: 'CountAPI (Hit)',
        url: 'https://api.countapi.xyz/hit/test-namespace/visitors',
        method: 'GET'
    },
    {
        name: 'CountAPI (עם הטוקן)',
        url: 'https://api.countapi.xyz/get/lia-multiplication-game-v2/visitors',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ut_Atq7mcamb6t6FQ00FYPC7rNfu1xzS5at05KRgiP7'
        }
    },
    {
        name: 'HTTPBin (CORS Test)',
        url: 'https://httpbin.org/json',
        method: 'GET'
    }
];

// Helper function to make HTTP requests
function makeRequest(options) {
    return new Promise((resolve, reject) => {
        const protocol = options.url.startsWith('https') ? https : http;
        const url = new URL(options.url);
        
        const requestOptions = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname + url.search,
            method: options.method || 'GET',
            headers: {
                'User-Agent': 'Counter-Test/1.0',
                ...options.headers
            },
            timeout: 5000
        };

        const req = protocol.request(requestOptions, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: jsonData,
                        success: res.statusCode >= 200 && res.statusCode < 300
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: data,
                        success: res.statusCode >= 200 && res.statusCode < 300,
                        parseError: e.message
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

// Test a single service
async function testService(service) {
    console.log(`\n🔍 Testing: ${service.name}`);
    console.log(`   URL: ${service.url}`);
    
    try {
        const result = await makeRequest(service);
        
        console.log(`   ✅ Status: ${result.status}`);
        console.log(`   📊 Response: ${JSON.stringify(result.data, null, 2)}`);
        
        if (result.parseError) {
            console.log(`   ⚠️  Parse Error: ${result.parseError}`);
        }
        
        // Check for specific counter values
        if (result.data && typeof result.data.value === 'number') {
            console.log(`   🎯 Counter Value: ${result.data.value}`);
        }
        
        return {
            service: service.name,
            success: result.success,
            status: result.status,
            hasCounterValue: result.data && typeof result.data.value === 'number',
            data: result.data
        };
        
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return {
            service: service.name,
            success: false,
            error: error.message
        };
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Counter API Tests...');
    console.log('=====================================');
    
    const results = [];
    
    for (const service of TEST_SERVICES) {
        const result = await testService(service);
        results.push(result);
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Summary
    console.log('\n📋 TEST SUMMARY');
    console.log('=====================================');
    
    const successful = results.filter(r => r.success);
    const withCounters = results.filter(r => r.hasCounterValue);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successful requests: ${successful.length}/${results.length}`);
    console.log(`🎯 Working counters: ${withCounters.length}/${results.length}`);
    console.log(`❌ Failed requests: ${failed.length}/${results.length}`);
    
    if (withCounters.length > 0) {
        console.log('\n🎉 RECOMMENDED SERVICES:');
        withCounters.forEach(service => {
            console.log(`   - ${service.service} (Value: ${service.data.value})`);
        });
    }
    
    if (failed.length > 0) {
        console.log('\n💥 FAILED SERVICES:');
        failed.forEach(service => {
            console.log(`   - ${service.service}: ${service.error || 'Unknown error'}`);
        });
    }
    
    // Recommendation
    console.log('\n💡 RECOMMENDATION:');
    if (withCounters.length > 0) {
        console.log('   ✅ יש לך שירותים שעובדים! המונה יכול לעבוד.');
    } else if (successful.length > 0) {
        console.log('   ⚠️  יש חיבור לאינטרנט אבל שירותי המונה לא מחזירים ערכים תקינים.');
    } else {
        console.log('   ❌ אין חיבור לשירותים. בדוק חיבור אינטרנט או CORS.');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = { runAllTests, testService };
