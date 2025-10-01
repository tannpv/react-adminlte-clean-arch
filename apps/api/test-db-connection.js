const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        console.log('Testing database connection...');

        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 7777,
            user: 'root',
            password: '',
            database: 'adminlte'
        });

        console.log('✅ Database connection successful!');

        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Query execution successful:', rows);

        await connection.end();
        console.log('✅ Connection closed successfully');

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Error details:', error);
    }
}

testConnection();

