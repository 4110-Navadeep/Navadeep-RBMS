const pool = require('./db');

/**
 * Dynamically check table columns and run migrations if columns are missing.
 * This is safe to run multiple times and prevents MySQL syntax errors with IF NOT EXISTS.
 */
const runMigrations = async () => {
  console.log('Checking database migrations...');
  
  const dbName = process.env.DB_NAME || 'resource_booking_db';

  const columnExists = async (table, column) => {
    try {
      const [rows] = await pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [dbName, table, column]
      );
      return rows.length > 0;
    } catch (err) {
      console.error(`Error checking column ${column} in table ${table}:`, err.message);
      return false;
    }
  };

  try {
    // 1. Check & Alter users table
    if (!(await columnExists('users', 'phone_number'))) {
      console.log('Adding phone_number column to users table...');
      await pool.query('ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) DEFAULT NULL');
    }
    if (!(await columnExists('users', 'address'))) {
      console.log('Adding address column to users table...');
      await pool.query('ALTER TABLE users ADD COLUMN address TEXT DEFAULT NULL');
    }

    // 2. Check & Alter resources table
    if (!(await columnExists('resources', 'price'))) {
      console.log('Adding price column to resources table...');
      await pool.query('ALTER TABLE resources ADD COLUMN price DECIMAL(10,2) DEFAULT 0.00');
    }

    // 3. Check & Alter booking_resource table
    if (!(await columnExists('booking_resource', 'user_name'))) {
      console.log('Adding user_name column to booking_resource table...');
      await pool.query('ALTER TABLE booking_resource ADD COLUMN user_name VARCHAR(255) DEFAULT NULL');
    }
    if (!(await columnExists('booking_resource', 'user_email'))) {
      console.log('Adding user_email column to booking_resource table...');
      await pool.query('ALTER TABLE booking_resource ADD COLUMN user_email VARCHAR(255) DEFAULT NULL');
    }
    if (!(await columnExists('booking_resource', 'user_phone'))) {
      console.log('Adding user_phone column to booking_resource table...');
      await pool.query('ALTER TABLE booking_resource ADD COLUMN user_phone VARCHAR(20) DEFAULT NULL');
    }
    if (!(await columnExists('booking_resource', 'user_address'))) {
      console.log('Adding user_address column to booking_resource table...');
      await pool.query('ALTER TABLE booking_resource ADD COLUMN user_address TEXT DEFAULT NULL');
    }
    if (!(await columnExists('booking_resource', 'booking_amount'))) {
      console.log('Adding booking_amount column to booking_resource table...');
      await pool.query('ALTER TABLE booking_resource ADD COLUMN booking_amount DECIMAL(10,2) DEFAULT 0.00');
    }

    console.log('✔ Database migrations completed.');
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    throw error;
  }
};

module.exports = runMigrations;
