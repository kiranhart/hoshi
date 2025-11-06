import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function applyAllergyMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = mysql.createPool(databaseUrl);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Add severity column if it doesn't exist
    try {
      await connection.query(`
        ALTER TABLE \`allergy\` 
        ADD COLUMN \`severity\` varchar(20) DEFAULT 'mild' NOT NULL
      `);
      console.log('✓ Added severity column');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ Severity column already exists');
      } else {
        throw error;
      }
    }

    // Add is_medicine column if it doesn't exist
    try {
      await connection.query(`
        ALTER TABLE \`allergy\` 
        ADD COLUMN \`is_medicine\` boolean DEFAULT false NOT NULL
      `);
      console.log('✓ Added is_medicine column');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ is_medicine column already exists');
      } else {
        throw error;
      }
    }

    await connection.commit();
    console.log('✅ Migration completed successfully');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

applyAllergyMigration().catch(console.error);

