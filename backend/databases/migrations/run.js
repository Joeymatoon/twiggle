import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    // Create Supabase client directly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_DB_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables. Please check your .env file.');
    }

    console.log('Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Define migration file paths
    const migrationFiles = [
      'add_admin_column.sql',
      'create_marketplace_table.sql'
    ];

    // Execute each migration file
    for (const file of migrationFiles) {
      try {
        console.log(`Executing migration: ${file}...`);
        const migrationPath = join(__dirname, file);
        const migrationSQL = readFileSync(migrationPath, 'utf8');

        // Execute the SQL directly using rpc
        const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
        
        if (error) {
          console.error(`Error executing migration ${file}:`, error);
          // Continue with next migration instead of throwing
          console.log('Continuing with next migration...');
        } else {
          console.log(`Migration ${file} completed successfully!`);
        }
      } catch (err) {
        console.error(`Error reading or executing ${file}:`, err);
        // Continue with next migration
        console.log('Continuing with next migration...');
      }
    }

    console.log('All migrations completed!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 