import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function applyPrimaryColorMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = mysql.createPool(databaseUrl);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Add primary_color column if it doesn't exist
    try {
      await connection.query(`
        ALTER TABLE \`page\` 
        ADD COLUMN \`primary_color\` varchar(7) NULL
      `);
      console.log('✓ Added primary_color column to page table');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ primary_color column already exists');
      } else {
        throw error;
      }
    }

    // Update color_mode column length to support 'neobrutalism'
    try {
      await connection.query(`
        ALTER TABLE \`page\` 
        MODIFY COLUMN \`color_mode\` varchar(20) NOT NULL DEFAULT 'light'
      `);
      console.log('✓ Updated color_mode column length');
    } catch (error: any) {
      console.log('⚠ Could not update color_mode column:', error.message);
      // Don't throw, this might already be updated
    }

    await connection.commit();
    console.log('✅ Primary color migration completed successfully');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

applyPrimaryColorMigration().catch(console.error);

