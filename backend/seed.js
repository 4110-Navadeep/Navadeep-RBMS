const bcrypt = require('bcryptjs');
const pool = require('./config/db');

const seedData = async () => {
  try {
    console.log('Running database seeding script...');

    // 1. Ensure the Admin User exists
    const adminEmail = 'admin@resourcebooking.com';
    const [existingAdmin] = await pool.query('SELECT * FROM users WHERE email = ?', [adminEmail]);

    if (existingAdmin.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      
      await pool.query(
        `INSERT INTO users (name, email, password, role) 
         VALUES ('System Administrator', ?, ?, 'ADMIN')`,
        [adminEmail, hashedPassword]
      );
      console.log('✔ Default Admin account created: admin@resourcebooking.com / Admin@123');
    } else {
      console.log('✔ Admin account already exists. Skipping...');
    }

    // 2. Ensure default resources exist
    const defaultResources = [
      {
        name: 'Seminar Hall',
        description: 'Spacious seminar hall with modern audiovisual equipment, presentation tools, and comfortable seating.',
        capacity: 150,
        image_url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800',
        availability: 1
      },
      {
        name: 'Computer Lab',
        description: 'Fully equipped computer lab with high-speed internet connection and pre-installed developer tools.',
        capacity: 50,
        image_url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800',
        availability: 1
      },
      {
        name: 'Party Hall',
        description: 'Perfect hall for parties, social gatherings, celebrations, and festive events with custom lighting.',
        capacity: 200,
        image_url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800',
        availability: 1
      },
      {
        name: 'Marriage Hall',
        description: 'Elegant grand marriage hall for marriages, receptions, and large traditional ceremonies.',
        capacity: 500,
        image_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800',
        availability: 1
      },
      {
        name: 'Conference Room A',
        description: 'Corporate style conference room equipped with dual screens, smart board, and VC systems.',
        capacity: 20,
        image_url: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=800',
        availability: 1
      },
      {
        name: 'Training Room 101',
        description: 'Flexible layouts for workshops, interactive tutorials, educational lectures, and training modules.',
        capacity: 40,
        image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
        availability: 1
      },
      {
        name: 'Meeting Room Alpha',
        description: 'Cozy space ideal for interviews, collaborative team brainstorms, and group discussions.',
        capacity: 8,
        image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
        availability: 1
      }
    ];

    for (const res of defaultResources) {
      const [existingRes] = await pool.query('SELECT * FROM resources WHERE name = ?', [res.name]);
      if (existingRes.length === 0) {
        await pool.query(
          `INSERT INTO resources (name, description, capacity, image_url, availability) 
           VALUES (?, ?, ?, ?, ?)`,
          [res.name, res.description, res.capacity, res.image_url, res.availability]
        );
        console.log(`✔ Seeded resource: ${res.name}`);
      }
    }

    console.log('Seeding process finished successfully.');
  } catch (error) {
    console.error('Seeding process failed:', error);
  }
};

module.exports = seedData;

// Allow direct execution if run via CLI
if (require.main === module) {
  seedData().then(() => process.exit(0));
}
