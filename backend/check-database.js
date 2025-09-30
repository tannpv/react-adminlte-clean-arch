const mysql = require('mysql2/promise');

async function checkDatabase() {
  let connection;
  
  try {
    console.log('🔍 Checking database directly...');
    
    // Create connection using the same config as the backend
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '7777'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'adminlte'
    });
    
    console.log('✅ Connected to database');
    
    // Check languages table
    const [languages] = await connection.execute('SELECT * FROM languages');
    console.log('Languages in database:', languages);
    
    // Check language_values table
    const [translations] = await connection.execute('SELECT * FROM language_values LIMIT 10');
    console.log('Translations in database (first 10):', translations);
    
    // Check specific translation
    const [specificTranslation] = await connection.execute(
      'SELECT * FROM language_values WHERE language_code = ? AND original_key = ?',
      ['en', 'nav.dashboard']
    );
    console.log('Specific translation for nav.dashboard:', specificTranslation);
    
    // Check MD5 hash
    const crypto = require('crypto');
    const keyHash = crypto.createHash('md5').update('nav.dashboard').digest('hex');
    console.log(`MD5 hash for nav.dashboard: ${keyHash}`);
    
    const [hashTranslation] = await connection.execute(
      'SELECT * FROM language_values WHERE language_code = ? AND key_hash = ?',
      ['en', keyHash]
    );
    console.log('Translation by hash:', hashTranslation);
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabase();
