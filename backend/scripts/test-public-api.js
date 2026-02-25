const http = require('http');
const fs = require('fs');

const branchId = 'ad70a739-48ba-48ec-81d5-a06899ea7c71';
const endpoints = ['rooms', 'services', 'team'];

async function fetchAll() {
    const results = {};
    for (const end of endpoints) {
        results[end] = await new Promise((resolve) => {
            http.get(`http://localhost:3001/api/${end}?branchId=${branchId}`, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch {
                        resolve(data);
                    }
                });
            }).on('error', (err) => resolve({ error: err.message }));
        });
    }
    fs.writeFileSync('public_data_test.json', JSON.stringify(results, null, 2));
    console.log('Public data written to public_data_test.json');
}

fetchAll();
