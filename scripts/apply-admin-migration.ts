import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

async function applyAdminMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = mysql.createPool(databaseUrl);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Add is_admin column if it doesn't exist
    try {
      await connection.query(`
        ALTER TABLE \`user\` 
        ADD COLUMN \`is_admin\` boolean DEFAULT false NOT NULL
      `);
      console.log('✓ Added is_admin column');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ is_admin column already exists');
      } else {
        throw error;
      }
    }

    // Make the first user (by created_at) an admin if no admin exists
    try {
      const [users] = await connection.query<any[]>(`
        SELECT id, is_admin FROM \`user\` ORDER BY created_at ASC LIMIT 1
      `);
      
      if (users && users.length > 0) {
        const firstUser = users[0];
        const [admins] = await connection.query<any[]>(`
          SELECT COUNT(*) as count FROM \`user\` WHERE is_admin = true
        `);
        
        const adminCount = (admins as any[])[0]?.count || 0;
        
        if (adminCount === 0 && !firstUser.is_admin) {
          await connection.query(`
            UPDATE \`user\` SET is_admin = true WHERE id = ?
          `, [firstUser.id]);
          console.log('✓ Made first user an admin');
        } else {
          console.log('⚠ Admin already exists or first user is already admin');
        }
      }
    } catch (error: any) {
      console.log('⚠ Could not set first user as admin:', error.message);
      // Don't throw, this is not critical
    }

    await connection.commit();
    console.log('✅ Admin migration completed successfully');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

applyAdminMigration().catch(console.error);

