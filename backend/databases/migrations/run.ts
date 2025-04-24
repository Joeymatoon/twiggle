import { createServiceClient } from '../../../utils/supabase/service';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    const supabase = createServiceClient();
    
    // Read the migration files
    const migrationFiles = [
      'fix_all_tables.sql',
      'add_is_link_column.sql'
    ];

    for (const file of migrationFiles) {
      const migrationPath = join(__dirname, file);
      const migrationSQL = readFileSync(migrationPath, 'utf8');

      // Split the SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);

      // Execute each statement
      for (const statement of statements) {
        console.log('Executing statement:', statement.substring(0, 100) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error('Error executing statement:', error);
          throw error;
        }
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 