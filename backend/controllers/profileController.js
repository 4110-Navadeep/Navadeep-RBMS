const pool = require('../config/db');

/**
 * GET /api/profile
 * Returns the logged-in user's full profile
 */
const getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, phone_number, address, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error retrieving profile' });
  }
};

/**
 * PUT /api/profile
 * Updates the logged-in user's phone_number and address
 */
const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, phone_number, address } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  try {
    await pool.query(
      'UPDATE users SET name = ?, phone_number = ?, address = ? WHERE id = ?',
      [name, phone_number || null, address || null, userId]
    );

    // Return the updated user profile
    const [users] = await pool.query(
      'SELECT id, name, email, role, phone_number, address, created_at FROM users WHERE id = ?',
      [userId]
    );

    console.log(`✔ Profile updated for user ID: ${userId}`);
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: users[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

/**
 * GET /api/admin/users
 * Returns all users (Admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, phone_number, address, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users, total: users.length });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Error retrieving users' });
  }
};

/**
 * GET /api/admin/stats
 * Returns aggregate statistics for admin dashboard
 */
const getAdminStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ totalResources }]] = await pool.query('SELECT COUNT(*) as totalResources FROM resources');
    const [[{ totalBookings }]] = await pool.query('SELECT COUNT(*) as totalBookings FROM booking_resource');
    const [[{ pendingBookings }]] = await pool.query("SELECT COUNT(*) as pendingBookings FROM booking_resource WHERE status = 'Pending'");
    const [[{ approvedBookings }]] = await pool.query("SELECT COUNT(*) as approvedBookings FROM booking_resource WHERE status = 'Approved'");
    const [[{ rejectedBookings }]] = await pool.query("SELECT COUNT(*) as rejectedBookings FROM booking_resource WHERE status = 'Rejected'");
    const [[{ totalRevenue }]] = await pool.query("SELECT COALESCE(SUM(booking_amount), 0) as totalRevenue FROM booking_resource WHERE status = 'Approved'");

    // Revenue by resource
    const [revenueByResource] = await pool.query(
      `SELECT resource_name, COALESCE(SUM(booking_amount), 0) as revenue, COUNT(*) as bookings
       FROM booking_resource WHERE status = 'Approved'
       GROUP BY resource_name ORDER BY revenue DESC`
    );

    // Revenue by month (last 6 months)
    const [revenueByMonth] = await pool.query(
      `SELECT DATE_FORMAT(booking_date, '%b %Y') as month,
              COALESCE(SUM(booking_amount), 0) as revenue
       FROM booking_resource
       WHERE status = 'Approved' AND booking_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(booking_date, '%Y-%m')
       ORDER BY booking_date ASC`
    );

    res.json({
      totalUsers,
      totalResources,
      totalBookings,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      totalRevenue: parseFloat(totalRevenue),
      revenueByResource,
      revenueByMonth
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Error retrieving statistics' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  getAdminStats
};
