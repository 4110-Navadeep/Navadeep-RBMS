const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getAllUsers, getAdminStats } = require('../controllers/profileController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// GET /api/profile — Get logged-in user's profile
router.get('/', verifyToken, getProfile);

// PUT /api/profile — Update logged-in user's profile
router.put('/', verifyToken, updateProfile);

// GET /api/profile/admin/users — Get all users (Admin only)
router.get('/admin/users', verifyToken, isAdmin, getAllUsers);

// GET /api/profile/admin/stats — Get admin dashboard stats
router.get('/admin/stats', verifyToken, isAdmin, getAdminStats);

module.exports = router;
