const express = require('express');
const router = express.Router();
const { getResources, createResource, updateResource, deleteResource } = require('../controllers/resourceController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// GET /api/resources (Public/Authenticated)
router.get('/', getResources);

// POST /api/resources (Admin only)
router.post('/', verifyToken, isAdmin, createResource);

// PUT /api/resources/:id (Admin only)
router.put('/:id', verifyToken, isAdmin, updateResource);

// DELETE /api/resources/:id (Admin only)
router.delete('/:id', verifyToken, isAdmin, deleteResource);

module.exports = router;
