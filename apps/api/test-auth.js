const axios = require('axios');

async function testAuth() {
    const baseURL = 'http://localhost:3001/api/v1';

    try {
        console.log('Testing authentication endpoints...');

        // Test login endpoint
        console.log('\n1. Testing login endpoint...');
        try {
            const loginResponse = await axios.post(`${baseURL}/auth/login`, {
                email: 'test@example.com',
                password: 'password123'
            });
            console.log('✅ Login successful:', loginResponse.data);
        } catch (error) {
            console.log('❌ Login failed:', error.response?.data || error.message);
        }

        // Test register endpoint
        console.log('\n2. Testing register endpoint...');
        try {
            const registerResponse = await axios.post(`${baseURL}/auth/register`, {
                email: 'newuser@example.com',
                password: 'password123',
                firstName: 'New',
                lastName: 'User'
            });
            console.log('✅ Registration successful:', registerResponse.data);
        } catch (error) {
            console.log('❌ Registration failed:', error.response?.data || error.message);
        }

    } catch (error) {
        console.log('❌ Server connection failed:', error.message);
    }
}

testAuth();

