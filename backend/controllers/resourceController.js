const pool = require('../config/db');

/**
 * Get all resources (supports optional search and category filters)
 */
const getResources = async (req, res) => {
  try {
    const { search, availability } = req.query;
    let query = 'SELECT * FROM resources WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (availability) {
      query += ' AND availability = ?';
      params.push(availability === 'true' ? 1 : 0);
    }

    query += ' ORDER BY id DESC';

    const [resources] = await pool.query(query, params);
    
    // Map database tinyint availability to boolean for cleaner JSON API responses
    const formattedResources = resources.map(res => ({
      ...res,
      availability: !!res.availability
    }));

    res.json(formattedResources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Error retrieving resources' });
  }
};

/**
 * Create a resource (Admin only)
 */
const createResource = async (req, res) => {
  const { name, description, capacity, image_url, availability } = req.body;

  if (!name || !capacity) {
    return res.status(400).json({ message: 'Resource name and capacity are required' });
  }

  try {
    const isAvailable = availability !== undefined ? (availability ? 1 : 0) : 1;
    const [result] = await pool.query(
      'INSERT INTO resources (name, description, capacity, image_url, availability) VALUES (?, ?, ?, ?, ?)',
      [name, description, capacity, image_url || '', isAvailable]
    );

    res.status(201).json({
      message: 'Resource created successfully',
      resource: {
        id: result.insertId,
        name,
        description,
        capacity,
        image_url: image_url || '',
        availability: !!isAvailable
      }
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ message: 'Error creating resource' });
  }
};

/**
 * Update a resource (Admin only)
 */
const updateResource = async (req, res) => {
  const { id } = req.params;
  const { name, description, capacity, image_url, availability } = req.body;

  if (!name || !capacity) {
    return res.status(400).json({ message: 'Resource name and capacity are required' });
  }

  try {
    const [existing] = await pool.query('SELECT * FROM resources WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(444).json({ message: 'Resource not found' });
    }

    const isAvailable = availability !== undefined ? (availability ? 1 : 0) : 1;
    await pool.query(
      'UPDATE resources SET name = ?, description = ?, capacity = ?, image_url = ?, availability = ? WHERE id = ?',
      [name, description, capacity, image_url || '', isAvailable, id]
    );

    res.json({
      message: 'Resource updated successfully',
      resource: {
        id: parseInt(id),
        name,
        description,
        capacity,
        image_url: image_url || '',
        availability: !!isAvailable
      }
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ message: 'Error updating resource' });
  }
};

/**
 * Delete a resource (Admin only)
 */
const deleteResource = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await pool.query('SELECT * FROM resources WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    await pool.query('DELETE FROM resources WHERE id = ?', [id]);
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Error deleting resource' });
  }
};

module.exports = {
  getResources,
  createResource,
  updateResource,
  deleteResource
};
