import { pool } from '../db';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, '../migrations/add_points_field.sql');
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
