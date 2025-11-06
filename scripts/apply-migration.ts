import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

async function applyMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = mysql.createPool(databaseUrl);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Add username column to user table if it doesn't exist
    try {
      await connection.query(`
        ALTER TABLE \`user\` 
        ADD COLUMN \`username\` varchar(50) NULL
      `);
      console.log('✓ Added username column');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ Username column already exists');
      } else {
        throw error;
      }
    }

    // Add unique constraint on username if it doesn't exist
    try {
      await connection.query(`
        ALTER TABLE \`user\` 
        ADD UNIQUE KEY \`user_username_unique\` (\`username\`)
      `);
      console.log('✓ Added username unique constraint');
    } catch (error: any) {
      if (error.code === 'ER_DUP_KEYNAME' || error.code === 'ER_DUP_ENTRY') {
        console.log('⚠ Username unique constraint already exists');
      } else {
        throw error;
      }
    }

    // Create page table
    try {
      await connection.query(`
        CREATE TABLE \`page\` (
          \`id\` varchar(36) NOT NULL,
          \`user_id\` varchar(36) NOT NULL,
          \`username\` varchar(50) NOT NULL,
          \`first_name\` varchar(100),
          \`last_name\` varchar(100),
          \`email\` varchar(255),
          \`phone\` varchar(20),
          \`description\` text,
          \`is_private\` boolean NOT NULL DEFAULT false,
          \`unique_key\` varchar(36) NOT NULL,
          \`created_at\` timestamp(3) NOT NULL DEFAULT (now()),
          \`updated_at\` timestamp(3) NOT NULL DEFAULT (now()),
          CONSTRAINT \`page_id\` PRIMARY KEY(\`id\`),
          CONSTRAINT \`page_user_id_unique\` UNIQUE(\`user_id\`),
          CONSTRAINT \`page_username_unique\` UNIQUE(\`username\`),
          CONSTRAINT \`page_unique_key_unique\` UNIQUE(\`unique_key\`)
        )
      `);
      console.log('✓ Created page table');
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠ Page table already exists');
      } else {
        throw error;
      }
    }

    // Create medicine table
    try {
      await connection.query(`
        CREATE TABLE \`medicine\` (
          \`id\` varchar(36) NOT NULL,
          \`page_id\` varchar(36) NOT NULL,
          \`name\` varchar(255) NOT NULL,
          \`dosage\` text,
          \`frequency\` text,
          \`created_at\` timestamp(3) NOT NULL DEFAULT (now()),
          \`updated_at\` timestamp(3) NOT NULL DEFAULT (now()),
          CONSTRAINT \`medicine_id\` PRIMARY KEY(\`id\`)
        )
      `);
      console.log('✓ Created medicine table');
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠ Medicine table already exists');
      } else {
        throw error;
      }
    }

    // Create allergy table
    try {
      await connection.query(`
        CREATE TABLE \`allergy\` (
          \`id\` varchar(36) NOT NULL,
          \`page_id\` varchar(36) NOT NULL,
          \`name\` varchar(255) NOT NULL,
          \`reaction\` text,
          \`created_at\` timestamp(3) NOT NULL DEFAULT (now()),
          \`updated_at\` timestamp(3) NOT NULL DEFAULT (now()),
          CONSTRAINT \`allergy_id\` PRIMARY KEY(\`id\`)
        )
      `);
      console.log('✓ Created allergy table');
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠ Allergy table already exists');
      } else {
        throw error;
      }
    }

    // Add reaction column to allergy table if it doesn't exist
    try {
      await connection.query(`
        ALTER TABLE \`allergy\` 
        ADD COLUMN \`reaction\` text
      `);
      console.log('✓ Added reaction column to allergy table');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ Reaction column already exists in allergy table');
      } else {
        throw error;
      }
    }

    // Create emergency_contact table
    try {
      await connection.query(`
        CREATE TABLE \`emergency_contact\` (
          \`id\` varchar(36) NOT NULL,
          \`page_id\` varchar(36) NOT NULL,
          \`name\` varchar(255) NOT NULL,
          \`phone\` varchar(20),
          \`email\` varchar(255),
          \`relation\` varchar(100),
          \`created_at\` timestamp(3) NOT NULL DEFAULT (now()),
          \`updated_at\` timestamp(3) NOT NULL DEFAULT (now()),
          CONSTRAINT \`emergency_contact_id\` PRIMARY KEY(\`id\`)
        )
      `);
      console.log('✓ Created emergency_contact table');
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('⚠ Emergency_contact table already exists');
      } else {
        throw error;
      }
    }

    // Add relation column to emergency_contact table if it doesn't exist
    try {
      await connection.query(`
        ALTER TABLE \`emergency_contact\` 
        ADD COLUMN \`relation\` varchar(100)
      `);
      console.log('✓ Added relation column to emergency_contact table');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ Relation column already exists in emergency_contact table');
      } else {
        throw error;
      }
    }

    // Add foreign keys
    const foreignKeys = [
      {
        table: 'page',
        constraint: 'page_user_id_user_id_fk',
        column: 'user_id',
        refTable: 'user',
        refColumn: 'id',
      },
      {
        table: 'medicine',
        constraint: 'medicine_page_id_page_id_fk',
        column: 'page_id',
        refTable: 'page',
        refColumn: 'id',
      },
      {
        table: 'allergy',
        constraint: 'allergy_page_id_page_id_fk',
        column: 'page_id',
        refTable: 'page',
        refColumn: 'id',
      },
      {
        table: 'emergency_contact',
        constraint: 'emergency_contact_page_id_page_id_fk',
        column: 'page_id',
        refTable: 'page',
        refColumn: 'id',
      },
    ];

    for (const fk of foreignKeys) {
      try {
        await connection.query(`
          ALTER TABLE \`${fk.table}\` 
          ADD CONSTRAINT \`${fk.constraint}\` 
          FOREIGN KEY (\`${fk.column}\`) 
          REFERENCES \`${fk.refTable}\`(\`${fk.refColumn}\`) 
          ON DELETE cascade 
          ON UPDATE no action
        `);
        console.log(`✓ Added foreign key ${fk.constraint}`);
      } catch (error: any) {
        if (error.code === 'ER_DUP_KEYNAME' || error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠ Foreign key ${fk.constraint} already exists`);
        } else {
          throw error;
        }
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

applyMigration().catch(console.error);

