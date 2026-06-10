const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const pool = require('./config/db');
const seedData = require('./seed');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookings', bookingRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Resource Booking Management System API' });
});

// Database and server bootstrap
const startServer = async () => {
  try {
    console.log('Connecting to MySQL database...');
    const connection = await pool.getConnection();
    console.log('✔ Connected to database successfully.');
    connection.release();

    // Auto-create tables from schema.sql
    try {
      console.log('Initializing database tables from schema.sql...');
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        // Split queries by semicolon (ignoring comments/empty lines)
        const queries = schemaSql
          .split(';')
          .map(q => q.trim())
          .filter(q => q.length > 0);

        for (const query of queries) {
          await pool.query(query);
        }
        console.log('✔ Schema setup finished.');
      } else {
        console.warn('⚠ schema.sql not found at:', schemaPath);
      }
    } catch (schemaError) {
      console.error('Failed to run schema queries. Database tables may already exist.', schemaError);
    }

    // Run database seeder
    await seedData();

    // Start Express listener
    app.listen(PORT, () => {
      console.log(`✔ Backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('CRITICAL: Server initialization failed:', error);
    // If database connection fails, let's wait and retry or start server anyway (useful for docker-compose start order)
    console.log('Starting express server anyway so health checks/container does not immediately exit...');
    app.listen(PORT, () => {
      console.log(`✔ Backend server running on http://localhost:${PORT} (Database offline)`);
    });
  }
};

startServer();
