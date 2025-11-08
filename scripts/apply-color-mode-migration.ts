import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function applyColorModeMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = mysql.createPool(databaseUrl);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check if selected_theme column exists and rename it to color_mode
    try {
      // First check if selected_theme exists
      const [columns] = await connection.query<any[]>(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'page' 
        AND COLUMN_NAME = 'selected_theme'
      `);

      if (columns && columns.length > 0) {
        // Rename the column
        await connection.query(`
          ALTER TABLE \`page\` 
          CHANGE COLUMN \`selected_theme\` \`color_mode\` varchar(10) NOT NULL DEFAULT 'light'
        `);
        console.log('✓ Renamed selected_theme to color_mode');
      } else {
        // Add color_mode column if selected_theme doesn't exist
        await connection.query(`
          ALTER TABLE \`page\` 
          ADD COLUMN \`color_mode\` varchar(10) NOT NULL DEFAULT 'light'
        `);
        console.log('✓ Added color_mode column');
      }

      // Update any existing 'default' values to 'light'
      await connection.query(`
        UPDATE \`page\` 
        SET \`color_mode\` = 'light' 
        WHERE \`color_mode\` = 'default' OR \`color_mode\` IS NULL
      `);
      console.log('✓ Updated existing values to light mode');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ color_mode column already exists');
      } else {
        throw error;
      }
    }

    await connection.commit();
    console.log('✅ Color mode migration completed successfully');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

applyColorModeMigration().catch(console.error);

