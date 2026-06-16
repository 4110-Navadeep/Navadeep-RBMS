const express = require('express');
const router = express.Router();
const { getPricingByResource, createPricing, updatePricing, deletePricing } = require('../controllers/pricingController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// GET /api/pricing/:resourceId — Get all pricing slots for a resource (public)
router.get('/:resourceId', getPricingByResource);

// POST /api/pricing — Add a pricing slot (Admin only)
router.post('/', verifyToken, isAdmin, createPricing);

// PUT /api/pricing/:id — Update a pricing slot (Admin only)
router.put('/:id', verifyToken, isAdmin, updatePricing);

// DELETE /api/pricing/:id — Delete a pricing slot (Admin only)
router.delete('/:id', verifyToken, isAdmin, deletePricing);

module.exports = router;
