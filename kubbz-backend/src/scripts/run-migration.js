const pool = require('../config/database');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function runMigration() {
    try {
        const migrationPath = path.join(__dirname, '../migrations/add_rankings_fields.sql');
        const migration = fs.readFileSync(migrationPath, 'utf8');
        
        await pool.query(migration);
        console.log('Migration completed successfully');
        
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
