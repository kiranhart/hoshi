import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function applyThemeMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = mysql.createPool(databaseUrl);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Add selected_theme column if it doesn't exist
    try {
      await connection.query(`
        ALTER TABLE \`page\` 
        ADD COLUMN \`selected_theme\` varchar(50) NOT NULL DEFAULT 'default'
      `);
      console.log('✓ Added selected_theme column to page table');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ selected_theme column already exists');
      } else {
        throw error;
      }
    }

    await connection.commit();
    console.log('✅ Theme migration completed successfully');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

applyThemeMigration().catch(console.error);

