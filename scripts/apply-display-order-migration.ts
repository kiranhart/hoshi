import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function applyDisplayOrderMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = mysql.createPool(databaseUrl);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Add display_order column to medicine table if it doesn't exist
    try {
      await connection.query(`
        ALTER TABLE \`medicine\` 
        ADD COLUMN \`display_order\` int DEFAULT 0 NOT NULL
      `);
      console.log('✓ Added display_order column to medicine table');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ display_order column already exists in medicine table');
      } else {
        throw error;
      }
    }

    // Add display_order column to allergy table if it doesn't exist
    try {
      await connection.query(`
        ALTER TABLE \`allergy\` 
        ADD COLUMN \`display_order\` int DEFAULT 0 NOT NULL
      `);
      console.log('✓ Added display_order column to allergy table');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ display_order column already exists in allergy table');
      } else {
        throw error;
      }
    }

    // Update existing records to have proper display_order values
    // For medicines: set display_order based on created_at
    try {
      await connection.query(`
        UPDATE \`medicine\` m1
        SET \`display_order\` = (
          SELECT COUNT(*) 
          FROM \`medicine\` m2 
          WHERE m2.\`page_id\` = m1.\`page_id\` 
            AND (m2.\`created_at\` < m1.\`created_at\` 
                 OR (m2.\`created_at\` = m1.\`created_at\` AND m2.\`id\` <= m1.\`id\`))
        )
      `);
      console.log('✓ Updated display_order for existing medicines');
    } catch (error: any) {
      console.log('⚠ Could not update display_order for medicines:', error.message);
      // Don't throw, this is not critical
    }

    // For allergies: set display_order based on created_at
    try {
      await connection.query(`
        UPDATE \`allergy\` a1
        SET \`display_order\` = (
          SELECT COUNT(*) 
          FROM \`allergy\` a2 
          WHERE a2.\`page_id\` = a1.\`page_id\` 
            AND (a2.\`created_at\` < a1.\`created_at\` 
                 OR (a2.\`created_at\` = a1.\`created_at\` AND a2.\`id\` <= a1.\`id\`))
        )
      `);
      console.log('✓ Updated display_order for existing allergies');
    } catch (error: any) {
      console.log('⚠ Could not update display_order for allergies:', error.message);
      // Don't throw, this is not critical
    }

    await connection.commit();
    console.log('✅ Display order migration completed successfully');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

applyDisplayOrderMigration().catch(console.error);

