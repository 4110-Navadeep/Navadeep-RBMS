const pool = require('../config/db');

/**
 * GET /api/pricing/:resourceId
 * Returns all pricing slots for a resource (public)
 */
const getPricingByResource = async (req, res) => {
  const { resourceId } = req.params;

  try {
    const [pricing] = await pool.query(
      'SELECT * FROM resource_pricing WHERE resource_id = ? ORDER BY pricing_type, start_time',
      [resourceId]
    );
    res.json(pricing);
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({ message: 'Error retrieving pricing' });
  }
};

/**
 * POST /api/pricing
 * Create a new pricing slot (Admin only)
 */
const createPricing = async (req, res) => {
  const { resource_id, pricing_type, slot_name, start_time, end_time, price } = req.body;

  if (!resource_id || !pricing_type || !price) {
    return res.status(400).json({ message: 'resource_id, pricing_type, and price are required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO resource_pricing (resource_id, pricing_type, slot_name, start_time, end_time, price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [resource_id, pricing_type, slot_name || null, start_time || null, end_time || null, price]
    );

    console.log(`✔ Pricing slot created for resource ID: ${resource_id}`);
    res.status(201).json({
      message: 'Pricing slot created successfully',
      pricing: {
        id: result.insertId,
        resource_id,
        pricing_type,
        slot_name,
        start_time,
        end_time,
        price
      }
    });
  } catch (error) {
    console.error('Create pricing error:', error);
    res.status(500).json({ message: 'Error creating pricing slot' });
  }
};

/**
 * PUT /api/pricing/:id
 * Update a pricing slot (Admin only)
 */
const updatePricing = async (req, res) => {
  const { id } = req.params;
  const { pricing_type, slot_name, start_time, end_time, price } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM resource_pricing WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Pricing slot not found' });
    }

    await pool.query(
      `UPDATE resource_pricing SET pricing_type = ?, slot_name = ?, start_time = ?, end_time = ?, price = ?
       WHERE id = ?`,
      [pricing_type, slot_name || null, start_time || null, end_time || null, price, id]
    );

    res.json({ message: 'Pricing slot updated successfully' });
  } catch (error) {
    console.error('Update pricing error:', error);
    res.status(500).json({ message: 'Error updating pricing slot' });
  }
};

/**
 * DELETE /api/pricing/:id
 * Delete a pricing slot (Admin only)
 */
const deletePricing = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await pool.query('SELECT * FROM resource_pricing WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Pricing slot not found' });
    }

    await pool.query('DELETE FROM resource_pricing WHERE id = ?', [id]);
    res.json({ message: 'Pricing slot deleted successfully' });
  } catch (error) {
    console.error('Delete pricing error:', error);
    res.status(500).json({ message: 'Error deleting pricing slot' });
  }
};

module.exports = {
  getPricingByResource,
  createPricing,
  updatePricing,
  deletePricing
};
