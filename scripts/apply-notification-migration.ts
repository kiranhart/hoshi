import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function applyNotificationMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = mysql.createPool(databaseUrl);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Read the migration file
    const migrationPath = join(process.cwd(), 'drizzle', '0003_remarkable_hellion.sql');
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
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_TABLE') {
          console.log('⚠ Table already exists, skipping...');
        } else if (error.code === 'ER_DUP_KEYNAME' || error.code === 'ER_DUP_FIELDNAME') {
          console.log('⚠ Constraint/field already exists, skipping...');
        } else {
          console.error('Error executing statement:', error.message);
          throw error;
        }
      }
    }

    await connection.commit();
    console.log('✅ Notification migration completed successfully');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

applyNotificationMigration().catch(console.error);

