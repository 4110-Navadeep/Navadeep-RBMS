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
        `INSERT INTO users (name, email, password, role) VALUES ('System Administrator', ?, ?, 'ADMIN')`,
        [adminEmail, hashedPassword]
      );
      console.log('✔ Default Admin account created: admin@resourcebooking.com / Admin@123');
    } else {
      console.log('✔ Admin account already exists. Skipping...');
    }

    // 2. Default resources with pricing
    const defaultResources = [
      {
        name: 'Seminar Hall',
        description: 'Spacious seminar hall with modern audiovisual equipment, presentation tools, and comfortable seating.',
        capacity: 150,
        image_url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800',
        availability: 1,
        price: 8000.00,
        pricing: [
          { type: 'slot_based', slot: 'Morning', start: '08:00:00', end: '12:00:00', price: 2000 },
          { type: 'slot_based', slot: 'Afternoon', start: '12:00:00', end: '17:00:00', price: 3000 },
          { type: 'slot_based', slot: 'Evening', start: '17:00:00', end: '22:00:00', price: 4000 },
          { type: 'full_day', slot: 'Full Day', start: '08:00:00', end: '22:00:00', price: 8000 }
        ]
      },
      {
        name: 'Computer Lab',
        description: 'Fully equipped computer lab with high-speed internet connection and pre-installed developer tools.',
        capacity: 50,
        image_url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800',
        availability: 1,
        price: 500.00,
        pricing: [
          { type: 'hourly', slot: 'Per Hour', start: null, end: null, price: 500 }
        ]
      },
      {
        name: 'Party Hall',
        description: 'Perfect hall for parties, social gatherings, celebrations, and festive events with custom lighting.',
        capacity: 200,
        image_url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800',
        availability: 1,
        price: 25000.00,
        pricing: [
          { type: 'slot_based', slot: 'Morning', start: '08:00:00', end: '12:00:00', price: 8000 },
          { type: 'slot_based', slot: 'Evening', start: '17:00:00', end: '22:00:00', price: 12000 },
          { type: 'full_day', slot: 'Full Day', start: '08:00:00', end: '22:00:00', price: 25000 }
        ]
      },
      {
        name: 'Marriage Hall',
        description: 'Elegant grand marriage hall for marriages, receptions, and large traditional ceremonies.',
        capacity: 500,
        image_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800',
        availability: 1,
        price: 40000.00,
        pricing: [
          { type: 'slot_based', slot: 'Morning', start: '08:00:00', end: '12:00:00', price: 10000 },
          { type: 'slot_based', slot: 'Afternoon', start: '12:00:00', end: '17:00:00', price: 15000 },
          { type: 'slot_based', slot: 'Evening', start: '17:00:00', end: '22:00:00', price: 20000 },
          { type: 'full_day', slot: 'Full Day', start: '08:00:00', end: '22:00:00', price: 40000 }
        ]
      },
      {
        name: 'Conference Room A',
        description: 'Corporate style conference room equipped with dual screens, smart board, and VC systems.',
        capacity: 20,
        image_url: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=800',
        availability: 1,
        price: 1500.00,
        pricing: [
          { type: 'slot_based', slot: 'Half Day', start: '09:00:00', end: '13:00:00', price: 1000 },
          { type: 'slot_based', slot: 'Full Day', start: '09:00:00', end: '18:00:00', price: 1500 },
          { type: 'hourly', slot: 'Per Hour', start: null, end: null, price: 300 }
        ]
      },
      {
        name: 'Training Room 101',
        description: 'Flexible layouts for workshops, interactive tutorials, educational lectures, and training modules.',
        capacity: 40,
        image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
        availability: 1,
        price: 2000.00,
        pricing: [
          { type: 'slot_based', slot: 'Morning', start: '08:00:00', end: '13:00:00', price: 1200 },
          { type: 'slot_based', slot: 'Afternoon', start: '13:00:00', end: '18:00:00', price: 1200 },
          { type: 'full_day', slot: 'Full Day', start: '08:00:00', end: '18:00:00', price: 2000 }
        ]
      },
      {
        name: 'Meeting Room Alpha',
        description: 'Cozy space ideal for interviews, collaborative team brainstorms, and group discussions.',
        capacity: 8,
        image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
        availability: 1,
        price: 200.00,
        pricing: [
          { type: 'hourly', slot: 'Per Hour', start: null, end: null, price: 200 }
        ]
      }
    ];

    for (const res of defaultResources) {
      const [existingRes] = await pool.query('SELECT id FROM resources WHERE name = ?', [res.name]);

      let resourceId;
      if (existingRes.length === 0) {
        const [inserted] = await pool.query(
          `INSERT INTO resources (name, description, capacity, image_url, availability, price) VALUES (?, ?, ?, ?, ?, ?)`,
          [res.name, res.description, res.capacity, res.image_url, res.availability, res.price]
        );
        resourceId = inserted.insertId;
        console.log(`✔ Seeded resource: ${res.name} (₹${res.price})`);
      } else {
        // Update price if resource already exists
        resourceId = existingRes[0].id;
        await pool.query('UPDATE resources SET price = ? WHERE id = ?', [res.price, resourceId]);
        console.log(`✔ Updated price for: ${res.name}`);
      }

      // 3. Seed pricing slots
      const [existingPricing] = await pool.query(
        'SELECT id FROM resource_pricing WHERE resource_id = ?',
        [resourceId]
      );

      if (existingPricing.length === 0) {
        for (const slot of res.pricing) {
          await pool.query(
            `INSERT INTO resource_pricing (resource_id, pricing_type, slot_name, start_time, end_time, price)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [resourceId, slot.type, slot.slot, slot.start, slot.end, slot.price]
          );
        }
        console.log(`  ↳ Seeded ${res.pricing.length} pricing slot(s) for ${res.name}`);
      }
    }

    console.log('✔ Seeding process finished successfully.');
  } catch (error) {
    console.error('Seeding process failed:', error);
  }
};

module.exports = seedData;

// Allow direct execution if run via CLI
if (require.main === module) {
  seedData().then(() => process.exit(0));
}
