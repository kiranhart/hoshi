import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

async function applyDiagnosisMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = mysql.createPool(databaseUrl);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Read the migration file
    const migrationPath = join(process.cwd(), 'drizzle', '0002_conscious_tag.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Split by statement breakpoint and execute each statement
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      try {
        await connection.query(statement);
        console.log('✓ Executed statement successfully');
      } catch (error: any) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log('⚠ Table already exists, skipping...');
        } else if (error.code === 'ER_DUP_KEYNAME') {
          console.log('⚠ Constraint already exists, skipping...');
        } else {
          throw error;
        }
      }
    }

    await connection.commit();
    console.log('✅ Diagnosis migration completed successfully');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

applyDiagnosisMigration().catch(console.error);

