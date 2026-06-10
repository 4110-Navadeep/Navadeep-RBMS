const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, getAdminBookings, approveBooking, rejectBooking } = require('../controllers/bookingController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// POST /api/bookings (User only)
router.post('/', verifyToken, createBooking);

// GET /api/bookings/user (User only)
router.get('/user', verifyToken, getUserBookings);

// GET /api/bookings/admin (Admin only)
router.get('/admin', verifyToken, isAdmin, getAdminBookings);

// PUT /api/bookings/approve/:id (Admin only)
router.put('/approve/:id', verifyToken, isAdmin, approveBooking);

// PUT /api/bookings/reject/:id (Admin only)
router.put('/reject/:id', verifyToken, isAdmin, rejectBooking);

module.exports = router;
