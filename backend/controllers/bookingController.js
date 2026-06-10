const pool = require('../config/db');
const { sendBookingEmail } = require('../services/emailService');

/**
 * Helper to get User email and name by ID
 */
const getUserById = async (userId) => {
  const [users] = await pool.query('SELECT name, email FROM users WHERE id = ?', [userId]);
  return users[0];
};

/**
 * Helper to get Resource details
 */
const getResourceById = async (resourceId) => {
  const [resources] = await pool.query('SELECT name, availability FROM resources WHERE id = ?', [resourceId]);
  return resources[0];
};

/**
 * User books a resource
 */
const createBooking = async (req, res) => {
  const { resource_id, booking_date, booking_start_time, booking_end_time, purpose } = req.body;
  const user_id = req.user.id;

  if (!resource_id || !booking_date || !booking_start_time || !booking_end_time) {
    return res.status(400).json({ message: 'All booking fields are required' });
  }

  if (booking_start_time >= booking_end_time) {
    return res.status(400).json({ message: 'Start time must be before end time' });
  }

  try {
    // 1. Verify resource exists and is active
    const resource = await getResourceById(resource_id);
    if (!resource) {
      return res.status(444).json({ message: 'Resource not found' });
    }
    if (!resource.availability) {
      return res.status(400).json({ message: 'Resource is currently not available for booking' });
    }

    // 2. Prevent double booking - overlap check
    // A booking overlaps if (start1 < end2) AND (end1 > start2)
    const [overlap] = await pool.query(
      `SELECT * FROM booking_resource 
       WHERE resource_id = ? 
         AND booking_date = ? 
         AND status != 'Rejected' 
         AND (booking_start_time < ? AND booking_end_time > ?)`,
      [resource_id, booking_date, booking_end_time, booking_start_time]
    );

    if (overlap.length > 0) {
      return res.status(400).json({ 
        message: 'Conflict: The selected resource is already booked for this time slot. Please choose another slot.' 
      });
    }

    // 3. Save booking in DB
    const [result] = await pool.query(
      `INSERT INTO booking_resource 
       (user_id, resource_id, resource_name, booking_date, booking_start_time, booking_end_time, purpose, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [user_id, resource_id, resource.name, booking_date, booking_start_time, booking_end_time, purpose || '']
    );

    // 4. Send Confirmation Email
    const user = await getUserById(user_id);
    if (user) {
      const emailDetails = {
        resourceName: resource.name,
        date: booking_date,
        startTime: booking_start_time,
        endTime: booking_end_time,
        purpose: purpose
      };
      await sendBookingEmail(user.email, user.name, emailDetails, 'Pending');
    }

    res.status(201).json({
      message: 'Booking submitted successfully. Pending admin approval.',
      booking: {
        id: result.insertId,
        user_id,
        resource_id,
        resource_name: resource.name,
        booking_date,
        booking_start_time,
        booking_end_time,
        purpose,
        status: 'Pending'
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Error processing booking' });
  }
};

/**
 * Get bookings for the logged-in User
 */
const getUserBookings = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [bookings] = await pool.query(
      'SELECT id, resource_id, resource_name, DATE_FORMAT(booking_date, "%Y-%m-%d") as booking_date, booking_start_time, booking_end_time, purpose, status, remarks, created_at FROM booking_resource WHERE user_id = ? ORDER BY id DESC',
      [user_id]
    );
    res.json(bookings);
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Error retrieving your bookings' });
  }
};

/**
 * Get all bookings (Admin only)
 */
const getAdminBookings = async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT b.id, b.user_id, b.resource_id, b.resource_name, 
              DATE_FORMAT(b.booking_date, "%Y-%m-%d") as booking_date, 
              b.booking_start_time, b.booking_end_time, b.purpose, b.status, b.remarks, b.created_at,
              u.name as user_name, u.email as user_email
       FROM booking_resource b
       JOIN users u ON b.user_id = u.id
       ORDER BY b.id DESC`
    );
    res.json(bookings);
  } catch (error) {
    console.error('Get admin bookings error:', error);
    res.status(500).json({ message: 'Error retrieving all bookings' });
  }
};

/**
 * Approve a booking (Admin only)
 */
const approveBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const [bookings] = await pool.query('SELECT * FROM booking_resource WHERE id = ?', [id]);
    if (bookings.length === 0) {
      return res.status(444).json({ message: 'Booking not found' });
    }

    const booking = bookings[0];
    if (booking.status === 'Approved') {
      return res.status(400).json({ message: 'Booking is already approved' });
    }

    // Double-check overlaps before final approval in case of race conditions
    const [overlap] = await pool.query(
      `SELECT * FROM booking_resource 
       WHERE resource_id = ? 
         AND booking_date = ? 
         AND id != ?
         AND status = 'Approved' 
         AND (booking_start_time < ? AND booking_end_time > ?)`,
      [booking.resource_id, booking.booking_date, id, booking.booking_end_time, booking.booking_start_time]
    );

    if (overlap.length > 0) {
      return res.status(400).json({ 
        message: 'Conflict: Cannot approve. Another booking has already been approved for this slot.' 
      });
    }

    // Update status to Approved
    await pool.query('UPDATE booking_resource SET status = "Approved", remarks = NULL WHERE id = ?', [id]);

    // Send confirmation email
    const user = await getUserById(booking.user_id);
    if (user) {
      const emailDetails = {
        resourceName: booking.resource_name,
        date: booking.booking_date.toISOString().split('T')[0],
        startTime: booking.booking_start_time,
        endTime: booking.booking_end_time,
        purpose: booking.purpose
      };
      await sendBookingEmail(user.email, user.name, emailDetails, 'Approved');
    }

    res.json({ message: 'Booking approved successfully' });
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({ message: 'Error approving booking' });
  }
};

/**
 * Reject a booking (Admin only)
 */
const rejectBooking = async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;

  try {
    const [bookings] = await pool.query('SELECT * FROM booking_resource WHERE id = ?', [id]);
    if (bookings.length === 0) {
      return res.status(444).json({ message: 'Booking not found' });
    }

    const booking = bookings[0];

    // Update status to Rejected
    await pool.query('UPDATE booking_resource SET status = "Rejected", remarks = ? WHERE id = ?', [remarks || 'Rejected by Administrator', id]);

    // Send confirmation email
    const user = await getUserById(booking.user_id);
    if (user) {
      const emailDetails = {
        resourceName: booking.resource_name,
        date: booking.booking_date.toISOString().split('T')[0],
        startTime: booking.booking_start_time,
        endTime: booking.booking_end_time,
        purpose: booking.purpose,
        remarks: remarks || 'Rejected by Administrator'
      };
      await sendBookingEmail(user.email, user.name, emailDetails, 'Rejected');
    }

    res.json({ message: 'Booking rejected successfully' });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ message: 'Error rejecting booking' });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getAdminBookings,
  approveBooking,
  rejectBooking
};
